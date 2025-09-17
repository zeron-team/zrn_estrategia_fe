// src/pages/CrmPage.js
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  IconButton,
  Chip,
  Button,
  Divider,
  Snackbar,
  Alert,
  CircularProgress,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  useMediaQuery,
  Slide,
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';

import MoreVertIcon from '@mui/icons-material/MoreVert';
import TagIcon from '@mui/icons-material/Tag';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import RefreshIcon from '@mui/icons-material/Refresh';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import MessageIcon from '@mui/icons-material/Message';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';

import MainLayout from '../components/layout/MainLayout';
import apiClient from '../api/client';
import StudentList from '../components/crm/StudentList';
import ConversationView from '../components/crm/ConversationView';
import KpiCard from '../components/dashboard/KpiCard';

// ---------- Layout constants ----------
const MAX_FRAME_WIDTH = 1440;
const GAP = 16;
const KPI_CARD_HEIGHT = 140;
const NOTE_MAX = 1000;

// ---------- Notes API helpers ----------
const fetchNotes = async (studentId) => {
  const res = await apiClient.get('/api/crm/notes', { params: { student_id: studentId } });
  return res?.data || [];
};
const createNote = async (studentId, body, tags) => {
  const res = await apiClient.post('/api/crm/notes', { student_id: studentId, body, tags });
  return res?.data;
};
const updateNote = async (noteId, body, tags) => {
  const res = await apiClient.put(`/api/crm/notes/${noteId}`, { body, tags });
  return res?.data;
};
const removeNote = async (noteId) => {
  await apiClient.delete(`/api/crm/notes/${noteId}`);
};

// ---------- Tag UI (button-like, colored) ----------
const TAG_COLOR_MAP = {
  Seguimiento: 'primary',
  Llamar: 'info',
  Pago: 'success',
  Examen: 'warning',
  Urgente: 'error',
};

const TagButton = styled('button')(({ theme, 'data-color': color = 'primary', 'data-selected': selected }) => {
  const palette = theme.palette[color] || theme.palette.primary;
  return {
    appearance: 'none',
    border: `1px solid ${alpha(palette.main, selected ? 0.35 : 0.22)}`,
    backgroundColor: alpha(palette.main, selected ? 0.18 : 0.08),
    color: palette.main,
    padding: '8px 12px',
    lineHeight: 1,
    fontSize: 13,
    fontWeight: 600,
    borderRadius: 999,
    cursor: 'pointer',
    transition: 'background-color .15s ease, border-color .15s ease, transform .05s ease',
    whiteSpace: 'nowrap',
    '&:hover': {
      backgroundColor: alpha(palette.main, selected ? 0.26 : 0.14),
      borderColor: alpha(palette.main, 0.45),
    },
    '&:active': { transform: 'translateY(1px)' },
    '&:focus-visible': {
      outline: `2px solid ${alpha(palette.main, 0.6)}`,
      outlineOffset: 2,
    },
  };
});

// ---------- Fancy Note Dialog ----------
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

function NoteDialog({
  open,
  mode,              // 'create' | 'edit'
  draft,             // { id, body, tags: [] }
  setDraft,
  quickTags = [],    // e.g. ['Seguimiento','Llamar','Pago','Examen','Urgente']
  studentLabel,
  onClose,
  onSave,
  onDelete,          // only for edit
  saving = false,
}) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const valid = draft.body?.trim()?.length > 0 && draft.body.length <= NOTE_MAX;

  const toggleTag = (tag) => {
    setDraft((prev) => {
      const exists = prev.tags.includes(tag);
      return { ...prev, tags: exists ? prev.tags.filter((t) => t !== tag) : [...prev.tags, tag] };
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      fullScreen={fullScreen}
      TransitionComponent={Transition}
      PaperProps={{
        sx: {
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          boxShadow:
            theme.palette.mode === 'light'
              ? '0 14px 44px rgba(0,0,0,0.12)'
              : '0 20px 56px rgba(0,0,0,0.50)',
        },
      }}
      BackdropProps={{ sx: { backdropFilter: 'blur(4px) saturate(1.1)' } }}
    >
      {/* Title */}
      <DialogTitle sx={{ display: 'flex', alignItems: 'baseline', gap: 1, pr: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {mode === 'edit' ? 'Editar nota' : 'Nueva nota'}
        </Typography>
        {!!studentLabel && (
          <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
            {studentLabel}
          </Typography>
        )}
      </DialogTitle>

      {/* Content */}
      <DialogContent dividers sx={{ p: { xs: 2, md: 3 }, display: 'grid', gap: 2 }}>
        {/* Tag buttons (colored) */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.25 }}>
          {quickTags.map((t) => {
            const color = TAG_COLOR_MAP[t] || 'primary';
            const selected = draft.tags.includes(t);
            return (
              <TagButton
                key={t}
                type="button"
                data-color={color}
                data-selected={selected ? 1 : 0}
                onClick={() => toggleTag(t)}
                aria-pressed={selected}
                title={selected ? `Quitar tag: ${t}` : `Agregar tag: ${t}`}
              >
                {t}
              </TagButton>
            );
          })}
        </Box>

        {/* Text area */}
        <TextField
          autoFocus
          placeholder={mode === 'edit' ? 'Editar nota…' : 'Escribí la nota…'}
          fullWidth
          multiline
          minRows={6}
          maxRows={14}
          value={draft.body}
          onChange={(e) => setDraft((p) => ({ ...p, body: e.target.value.slice(0, NOTE_MAX) }))}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
              e.preventDefault();
              if (valid) onSave();
            }
          }}
        />

        {/* Footer info */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', fontSize: 12 }}>
          <span>Atajo: Ctrl/Cmd + Enter para guardar</span>
          <Box sx={{ ml: 'auto' }}>{draft.body.length}/{NOTE_MAX}</Box>
        </Box>
      </DialogContent>

      {/* Actions */}
      <DialogActions sx={{ p: { xs: 1.5, md: 2 }, gap: 1 }}>
        {mode === 'edit' && (
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={onDelete}
            disabled={saving}
          >
            Eliminar
          </Button>
        )}
        <Box sx={{ flex: 1 }} />
        <Button onClick={onClose} disabled={saving}>Cancelar</Button>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={onSave}
          disabled={!valid || saving}
        >
          {saving ? 'Guardando…' : mode === 'edit' ? 'Actualizar' : 'Guardar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ---------- Page ----------
const CrmPage = () => {
  const theme = useTheme();

  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [filters, setFilters] = useState({ student_name: '', start_date: '', end_date: '' });
  const [kpis, setKpis] = useState({ total_messages: 0, inbound_count: 0, outbound_count: 0 });

  // Notes state
  const [notes, setNotes] = useState([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [notesError, setNotesError] = useState(null);
  const [composer, setComposer] = useState({ body: '', tags: [] });
  const [savingNote, setSavingNote] = useState(false);
  const [editingId, setEditingId] = useState(null); // inline edit id
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  // NOTE DIALOG state
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [noteDialogMode, setNoteDialogMode] = useState('create'); // 'create' | 'edit'
  const [noteDraft, setNoteDraft] = useState({ id: null, body: '', tags: [] });

  const QUICK_TAGS = ['Seguimiento', 'Llamar', 'Pago', 'Examen', 'Urgente'];

  // --------- Data fetchers ---------
  const loadStudents = async (inputFilters = filters) => {
    try {
      const response = await apiClient.post('/api/crm/messages', inputFilters);
      setStudents(response.data || []);
    } catch (error) {
      console.error('Error al cargar los estudiantes:', error);
    }
  };

  const loadKpis = async () => {
    try {
      const kpisRes = await apiClient.get('/api/messages/kpis');
      const data = kpisRes?.data || {};
      setKpis({
        total_messages: data.total_messages ?? 0,
        inbound_count: data.inbound_count ?? 0,
        outbound_count: data.outbound_count ?? 0,
      });
    } catch (error) {
      console.error('Error al cargar los KPIs:', error);
    }
  };

  const loadNotes = useCallback(async () => {
    if (!selectedStudent?.id) {
      setNotes([]);
      return;
    }
    try {
      setNotesError(null);
      setNotesLoading(true);
      const data = await fetchNotes(selectedStudent.id);
      const list = Array.isArray(data) ? [...data].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) : [];
      setNotes(list);
    } catch (e) {
      console.error('Error al cargar notas:', e);
      setNotesError('No se pudieron cargar las notas.');
    } finally {
      setNotesLoading(false);
    }
  }, [selectedStudent]);

  // Initial load
  useEffect(() => {
    loadStudents();
    loadKpis();
  }, []);

  // Update list on filters change
  useEffect(() => {
    loadStudents(filters);
  }, [filters]);

  // Load notes on student change
  useEffect(() => {
    setComposer({ body: '', tags: [] });
    setEditingId(null);
    loadNotes();
  }, [selectedStudent, loadNotes]);

  // KPIs data
  const kpiData = useMemo(
    () => [
      { key: 'total', title: 'Total Mensajes', value: kpis.total_messages, icon: <MessageIcon /> },
      { key: 'inbound', title: 'Mensajes Entrantes', value: kpis.inbound_count, icon: <ArrowDownwardIcon />, color: 'success' },
      { key: 'outbound', title: 'Mensajes Salientes', value: kpis.outbound_count, icon: <ArrowUpwardIcon />, color: 'secondary' },
    ],
    [kpis]
  );

  const handleFilterChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });

  // --------- Inline composer handlers ---------
  const handleSaveNote = async () => {
    if (!selectedStudent?.id || !composer.body.trim()) return;
    try {
      setSavingNote(true);
      if (editingId) {
        await updateNote(editingId, composer.body.trim(), composer.tags);
        setToast({ open: true, message: 'Nota actualizada', severity: 'success' });
      } else {
        await createNote(selectedStudent.id, composer.body.trim(), composer.tags);
        setToast({ open: true, message: 'Nota guardada', severity: 'success' });
      }
      setComposer({ body: '', tags: [] });
      setEditingId(null);
      loadNotes();
    } catch (e) {
      console.error('Error al guardar nota:', e);
      setToast({ open: true, message: 'No se pudo guardar la nota', severity: 'error' });
    } finally {
      setSavingNote(false);
    }
  };
  const startEdit = (note) => { setEditingId(note.id); setComposer({ body: note.body || '', tags: note.tags || [] }); };
  const cancelEdit = () => { setEditingId(null); setComposer({ body: '', tags: [] }); };
  const handleDeleteNote = async (noteId) => {
    try {
      await removeNote(noteId);
      setToast({ open: true, message: 'Nota eliminada', severity: 'success' });
      if (editingId === noteId) cancelEdit();
      loadNotes();
    } catch (e) {
      console.error('Error al eliminar nota:', e);
      setToast({ open: true, message: 'No se pudo eliminar la nota', severity: 'error' });
    }
  };
  const handleComposerKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); handleSaveNote(); }
  };

  // --------- NOTE DIALOG openers (also used by checkbox -> preselected tag) ---------
  const openCreateNoteDialog = () => {
    setNoteDialogMode('create');
    setNoteDraft({ id: null, body: composer.body || '', tags: composer.tags || [] });
    setNoteDialogOpen(true);
  };
  const openEditNoteDialog = (note) => {
    setNoteDialogMode('edit');
    setNoteDraft({ id: note.id, body: note.body || '', tags: note.tags || [] });
    setNoteDialogOpen(true);
  };
  const openNoteDialogWithTag = (defaultTag) => {
    setNoteDialogMode('create');
    setNoteDraft({ id: null, body: '', tags: defaultTag ? [defaultTag] : [] });
    setNoteDialogOpen(true);
  };

  // --------- NOTE DIALOG actions ---------
  const saveNoteFromDialog = async () => {
    if (!selectedStudent?.id || !noteDraft.body.trim()) return;
    try {
      setSavingNote(true);
      if (noteDialogMode === 'edit') {
        await updateNote(noteDraft.id, noteDraft.body.trim(), noteDraft.tags);
        setToast({ open: true, message: 'Nota actualizada', severity: 'success' });
      } else {
        await createNote(selectedStudent.id, noteDraft.body.trim(), noteDraft.tags);
        setToast({ open: true, message: 'Nota guardada', severity: 'success' });
      }
      setNoteDialogOpen(false);
      setEditingId(null);
      setComposer({ body: '', tags: [] });
      loadNotes();
    } catch (e) {
      console.error('Error al guardar nota (modal):', e);
      setToast({ open: true, message: 'No se pudo guardar la nota', severity: 'error' });
    } finally {
      setSavingNote(false);
    }
  };
  const deleteNoteFromDialog = async () => {
    try {
      await removeNote(noteDraft.id);
      setToast({ open: true, message: 'Nota eliminada', severity: 'success' });
      setNoteDialogOpen(false);
      if (editingId === noteDraft.id) cancelEdit();
      loadNotes();
    } catch (e) {
      console.error('Error al eliminar nota (modal):', e);
      setToast({ open: true, message: 'No se pudo eliminar la nota', severity: 'error' });
    }
  };

  // Formatting
  const fmtDate = (s) => {
    if (!s) return '';
    const d = new Date(s);
    return d.toLocaleString('es-AR', { dateStyle: 'medium', timeStyle: 'short' });
  };

  // More menu per note
  const NoteActions = ({ note }) => {
    const [anchor, setAnchor] = useState(null);
    const open = Boolean(anchor);
    return (
      <>
        <IconButton size="small" onClick={(e) => setAnchor(e.currentTarget)}>
          <MoreVertIcon fontSize="small" />
        </IconButton>
        <Menu anchorEl={anchor} open={open} onClose={() => setAnchor(null)}>
          <MenuItem
            onClick={() => {
              setAnchor(null);
              openEditNoteDialog(note); // open modal edit
            }}
          >
            <EditIcon fontSize="small" style={{ marginRight: 8 }} /> Editar
          </MenuItem>
          <MenuItem
            onClick={() => {
              setAnchor(null);
              handleDeleteNote(note.id);
            }}
          >
            <DeleteIcon fontSize="small" style={{ marginRight: 8 }} /> Eliminar
          </MenuItem>
        </Menu>
      </>
    );
  };

  // grid spans
  const colSpanKPI = { xs: 'span 12', sm: 'span 6', md: 'span 4' };
  const colSpanLeft = { xs: 'span 12', md: 'span 4' };
  const colSpanRight = { xs: 'span 12', md: 'span 8' };

  return (
    <MainLayout>
      {/* Background ribbon */}
      <Box
        sx={{
          py: { xs: 2, md: 4 },
          px: { xs: 2, md: 3 },
          background:
            theme.palette.mode === 'light'
              ? `linear-gradient(180deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`
              : theme.palette.background.default,
        }}
      >
        {/* FRAME */}
        <Box sx={{ maxWidth: MAX_FRAME_WIDTH, mx: 'auto' }}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, md: 3.5 },
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              boxShadow:
                theme.palette.mode === 'light'
                  ? '0 6px 24px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)'
                  : '0 10px 30px rgba(0,0,0,0.35)',
              backgroundColor: theme.palette.background.paper,
            }}
          >
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Box>
                <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 1 }}>
                  CRM
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                  CRM de Mensajes
                </Typography>
              </Box>
              <IconButton
                aria-label="recargar"
                onClick={() => {
                  loadStudents();
                  loadKpis();
                  loadNotes();
                }}
                size="large"
              >
                <RefreshIcon />
              </IconButton>
            </Box>

            {/* GRID principal */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, minmax(0, 1fr))', gap: `${GAP}px` }}>
              {/* KPIs */}
              {kpiData.map((kpi) => (
                <Box key={kpi.key} sx={{ gridColumn: colSpanKPI, minWidth: 0 }}>
                  <Box sx={{ height: KPI_CARD_HEIGHT, width: '100%' }}>
                    <KpiCard title={kpi.title} value={kpi.value} icon={kpi.icon} color={kpi.color} sx={{ height: '100%' }} />
                  </Box>
                </Box>
              ))}

              {/* Filtros */}
              <Box sx={{ gridColumn: 'span 12', minWidth: 0 }}>
                <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Filtros
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, minmax(0, 1fr))', gap: `${GAP}px` }}>
                    <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 4' } }}>
                      <TextField fullWidth label="Nombre Alumno" name="student_name" value={filters.student_name} onChange={handleFilterChange} />
                    </Box>
                    <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 4' } }}>
                      <TextField fullWidth label="Fecha Desde" name="start_date" type="date" InputLabelProps={{ shrink: true }} value={filters.start_date} onChange={handleFilterChange} />
                    </Box>
                    <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 4' } }}>
                      <TextField fullWidth label="Fecha Hasta" name="end_date" type="date" InputLabelProps={{ shrink: true }} value={filters.end_date} onChange={handleFilterChange} />
                    </Box>
                  </Box>
                </Paper>
              </Box>

              {/* Columna izquierda: Alumnos */}
              <Box sx={{ gridColumn: colSpanLeft, minWidth: 0 }}>
                <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider', height: '100%' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5 }}>
                    Alumnos
                  </Typography>
                  <StudentList
                    students={students}
                    onSelectStudent={setSelectedStudent}
                    setStudents={setStudents}
                    // If your list uses checkboxes and wants to open the modal with a tag:
                    // onQuickNoteCreate={openNoteDialogWithTag}
                  />
                </Paper>
              </Box>

              {/* Columna derecha: Conversación + Notas */}
              <Box sx={{ gridColumn: colSpanRight, minWidth: 0 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: 560,
                  }}
                >
                  {/* Conversación */}
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5 }}>
                    Conversación
                  </Typography>
                  <Box sx={{ flex: 1, minHeight: 240, mb: 2, overflow: 'hidden' }}>
                    {selectedStudent ? (
                      <ConversationView
                        student={selectedStudent}
                        // If your conversation view has checkboxes that should pop the note dialog pre-tagged:
                        // onQuickNoteCreate={openNoteDialogWithTag}
                      />
                    ) : (
                      <Box sx={{ height: '100%', display: 'grid', placeItems: 'center', color: 'text.secondary' }}>
                        Seleccioná un alumno para ver la conversación y agregar notas.
                      </Box>
                    )}
                  </Box>

                  <Divider sx={{ my: 1.5 }} />

                  {/* Notas header + CTA modal */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <TagIcon fontSize="small" color="action" />
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Notas
                    </Typography>
                    <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        {selectedStudent ? `Alumno: ${selectedStudent?.name ?? selectedStudent?.full_name ?? selectedStudent?.id}` : ''}
                      </Typography>
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<NoteAddIcon />}
                        onClick={openCreateNoteDialog}
                        disabled={!selectedStudent}
                      >
                        Nueva nota
                      </Button>
                    </Box>
                  </Box>

                  {/* Inline composer (quick add) */}
                  <Paper
                    elevation={0}
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      backgroundColor: (t) => t.palette.background.default,
                      mb: 1.5,
                    }}
                  >
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                      {QUICK_TAGS.map((t) => {
                        const selected = composer.tags.includes(t);
                        return (
                          <Chip
                            key={t}
                            label={t}
                            size="small"
                            variant={selected ? 'filled' : 'outlined'}
                            color={selected ? 'primary' : 'default'}
                            onClick={() =>
                              setComposer((prev) => {
                                const exists = prev.tags.includes(t);
                                return { ...prev, tags: exists ? prev.tags.filter((x) => x !== t) : [...prev.tags, t] };
                              })
                            }
                          />
                        );
                      })}
                    </Box>

                    <TextField
                      placeholder={editingId ? 'Editar nota…' : 'Agregar una nota… (Ctrl/Cmd + Enter para guardar)'}
                      fullWidth
                      multiline
                      minRows={3}
                      maxRows={8}
                      value={composer.body}
                      onChange={(e) => setComposer((p) => ({ ...p, body: e.target.value.slice(0, NOTE_MAX) }))}
                      onKeyDown={handleComposerKeyDown}
                    />
                    <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}>
                      <Box sx={{ color: 'text.secondary', fontSize: 12 }}>{composer.body.length}/{NOTE_MAX}</Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {editingId && (
                          <Button onClick={cancelEdit} size="small">
                            Cancelar
                          </Button>
                        )}
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<SaveIcon />}
                          onClick={handleSaveNote}
                          disabled={!selectedStudent || !composer.body.trim() || savingNote}
                        >
                          {savingNote ? 'Guardando…' : editingId ? 'Actualizar' : 'Guardar'}
                        </Button>
                      </Box>
                    </Box>
                  </Paper>

                  {/* Notes list */}
                  <Box sx={{ minHeight: 120, maxHeight: 320, overflow: 'auto' }}>
                    {notesLoading ? (
                      <Box sx={{ py: 2, display: 'grid', gap: 1.25 }}>
                        {Array.from({ length: 4 }).map((_, i) => (
                          <Box key={i} sx={{ display: 'grid', gap: 0.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <CircularProgress size={16} />
                              <Box sx={{ height: 10, width: '40%', bgcolor: 'action.hover', borderRadius: 1 }} />
                            </Box>
                            <Box sx={{ height: 10, width: '100%', bgcolor: 'action.hover', borderRadius: 1 }} />
                          </Box>
                        ))}
                      </Box>
                    ) : notesError ? (
                      <Alert severity="error">{notesError}</Alert>
                    ) : notes.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">
                        No hay notas aún.
                      </Typography>
                    ) : (
                      <Box sx={{ display: 'grid', gap: 1.25 }}>
                        {notes.map((n) => (
                          <Paper key={n.id} variant="outlined" sx={{ p: 1.25, borderRadius: 1.5, display: 'grid', gap: 0.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="caption" color="text.secondary">
                                {fmtDate(n.created_at)} {n.author ? `· ${n.author}` : ''}
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                {(n.tags || []).map((t) => (
                                  <Chip key={`${n.id}-${t}`} size="small" label={t} variant="outlined" />
                                ))}
                              </Box>
                              <Box sx={{ ml: 'auto' }}>
                                <NoteActions note={n} />
                              </Box>
                            </Box>
                            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                              {n.body}
                            </Typography>
                          </Paper>
                        ))}
                      </Box>
                    )}
                  </Box>
                </Paper>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Box>

      {/* Toasts */}
      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setToast((t) => ({ ...t, open: false }))} severity={toast.severity} sx={{ width: '100%' }}>
          {toast.message}
        </Alert>
      </Snackbar>

      {/* NOTE DIALOG (modern, with colored button-tags) */}
      <NoteDialog
        open={noteDialogOpen}
        mode={noteDialogMode}
        draft={noteDraft}
        setDraft={setNoteDraft}
        quickTags={Object.keys(TAG_COLOR_MAP)} // ['Seguimiento','Llamar','Pago','Examen','Urgente']
        studentLabel={
          selectedStudent ? `Alumno: ${selectedStudent?.name ?? selectedStudent?.full_name ?? selectedStudent?.id}` : ''
        }
        onClose={() => setNoteDialogOpen(false)}
        onSave={saveNoteFromDialog}
        onDelete={noteDialogMode === 'edit' ? deleteNoteFromDialog : undefined}
        saving={savingNote}
      />
    </MainLayout>
  );
};

export default CrmPage;