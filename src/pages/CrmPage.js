// src/pages/CrmPage.js
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardHeader,
  TextField,
  Button,
  Chip,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Snackbar,
  Alert,
  Menu,
  MenuItem,
} from '@mui/material';

import RefreshIcon from '@mui/icons-material/Refresh';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import MessageIcon from '@mui/icons-material/Message';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';

import Page from '../components/layout/Page';
import apiClient from '../api/client';
import StudentList from '../components/crm/StudentList';
import ConversationView from '../components/crm/ConversationView';
import KpiCard from '../components/dashboard/KpiCard';

const NOTE_MAX = 1000;

/* --------------------------- Notes API helpers --------------------------- */
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
const removeNote = async (noteId) => apiClient.delete(`/api/crm/notes/${noteId}`);

/* ---------------------------- Note Dialog UI ---------------------------- */
function NoteDialog({
  open,
  onClose,
  onSave,
  onDelete,
  mode = 'create', // 'create' | 'edit'
  draft,
  setDraft,
  quickTags,
  saving,
}) {
  const valid = draft.body?.trim()?.length > 0 && draft.body.length <= NOTE_MAX;

  const toggleTag = (t) =>
    setDraft((prev) => ({
      ...prev,
      tags: prev.tags.includes(t) ? prev.tags.filter((x) => x !== t) : [...prev.tags, t],
    }));

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} fullWidth maxWidth="md">
      <DialogTitle>{mode === 'edit' ? 'Editar nota' : 'Nueva nota'}</DialogTitle>

      <DialogContent dividers sx={{ display: 'grid', gap: 2 }}>
        {/* Tag chips (button-like) */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {quickTags.map((t) => {
            const selected = draft.tags.includes(t);
            return (
              <Chip
                key={t}
                label={t}
                size="small"
                color={selected ? 'primary' : 'default'}
                variant={selected ? 'filled' : 'outlined'}
                onClick={() => toggleTag(t)}
              />
            );
          })}
        </Box>

        {/* Note text */}
        <TextField
          autoFocus
          fullWidth
          multiline
          minRows={6}
          placeholder={mode === 'edit' ? 'Editar nota…' : 'Escribí la nota…'}
          value={draft.body}
          onChange={(e) => setDraft((p) => ({ ...p, body: e.target.value.slice(0, NOTE_MAX) }))}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && valid) {
              e.preventDefault();
              onSave();
            }
          }}
        />
        <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
          {draft.body.length}/{NOTE_MAX}
        </Typography>
      </DialogContent>

      <DialogActions>
        {mode === 'edit' && (
          <Button startIcon={<DeleteIcon />} color="error" onClick={onDelete} disabled={saving}>
            Eliminar
          </Button>
        )}
        <Button onClick={onClose} disabled={saving}>
          Cancelar
        </Button>
        <Button variant="contained" startIcon={<SaveIcon />} onClick={onSave} disabled={!valid || saving}>
          {saving ? 'Guardando…' : mode === 'edit' ? 'Actualizar' : 'Guardar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

/* --------------------------------- Page --------------------------------- */
export default function CrmPage() {
  /* ---- Core state ---- */
  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const [filters, setFilters] = useState({ student_name: '', start_date: '', end_date: '' });
  const [kpis, setKpis] = useState({ total_messages: 0, inbound_count: 0, outbound_count: 0 });

  /* ---- Notes state ---- */
  const [notes, setNotes] = useState([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [notesError, setNotesError] = useState(null);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  const QUICK_TAGS = ['Seguimiento', 'Llamar', 'Pago', 'Examen', 'Urgente'];

  /* ---- Note dialog state ---- */
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [noteDialogMode, setNoteDialogMode] = useState('create'); // 'create' | 'edit'
  const [noteDraft, setNoteDraft] = useState({ id: null, body: '', tags: [] });
  const [savingNote, setSavingNote] = useState(false);

  /* ---- Per-note menu ---- */
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
              setNoteDialogMode('edit');
              setNoteDraft({ id: note.id, body: note.body || '', tags: note.tags || [] });
              setNoteDialogOpen(true);
            }}
          >
            Editar
          </MenuItem>
          <MenuItem
            onClick={async () => {
              setAnchor(null);
              try {
                await removeNote(note.id);
                setToast({ open: true, message: 'Nota eliminada', severity: 'success' });
                loadNotes();
              } catch {
                setToast({ open: true, message: 'No se pudo eliminar', severity: 'error' });
              }
            }}
          >
            Eliminar
          </MenuItem>
        </Menu>
      </>
    );
  };

  /* --------------------------- Data loaders --------------------------- */
  const loadStudents = async (inputFilters = filters) => {
    setStudentsLoading(true);
    try {
      const response = await apiClient.post('/api/crm/messages', inputFilters);
      setStudents(response.data || []);
    } catch {
      // silent fail shown in list if needed
    } finally {
      setStudentsLoading(false);
    }
  };

  const loadKpis = async () => {
    try {
      const kpisRes = await apiClient.get('/api/messages/kpis');
      const d = kpisRes?.data || {};
      setKpis({
        total_messages: d.total_messages ?? 0,
        inbound_count: d.inbound_count ?? 0,
        outbound_count: d.outbound_count ?? 0,
      });
    } catch {
      // ignore for now
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
      const list = Array.isArray(data)
        ? [...data].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        : [];
      setNotes(list);
    } catch {
      setNotesError('No se pudieron cargar las notas.');
    } finally {
      setNotesLoading(false);
    }
  }, [selectedStudent]);

  /* ------------------------------ Effects ------------------------------ */
  useEffect(() => {
    loadStudents();
    loadKpis();
  }, []);

  useEffect(() => {
    loadStudents(filters);
  }, [filters]);

  useEffect(() => {
    loadNotes();
  }, [selectedStudent, loadNotes]);

  /* ---------------------------- Derived data --------------------------- */
  const kpiData = useMemo(
    () => [
      { key: 'total', title: 'Total Mensajes', value: kpis.total_messages, icon: <MessageIcon /> },
      { key: 'inbound', title: 'Mensajes Entrantes', value: kpis.inbound_count, icon: <ArrowDownwardIcon />, color: 'success' },
      { key: 'outbound', title: 'Mensajes Salientes', value: kpis.outbound_count, icon: <ArrowUpwardIcon />, color: 'secondary' },
    ],
    [kpis]
  );

  /* -------------------------- Note dialog actions -------------------------- */
  const openCreateNote = () => {
    setNoteDialogMode('create');
    setNoteDraft({ id: null, body: '', tags: [] });
    setNoteDialogOpen(true);
  };

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
      loadNotes();
    } catch {
      setToast({ open: true, message: 'No se pudo guardar la nota', severity: 'error' });
    } finally {
      setSavingNote(false);
    }
  };

  const deleteNoteFromDialog = async () => {
    try {
      setSavingNote(true);
      await removeNote(noteDraft.id);
      setToast({ open: true, message: 'Nota eliminada', severity: 'success' });
      setNoteDialogOpen(false);
      loadNotes();
    } catch {
      setToast({ open: true, message: 'No se pudo eliminar la nota', severity: 'error' });
    } finally {
      setSavingNote(false);
    }
  };

  /* ------------------------------- Helpers ------------------------------ */
  const fmtDate = (s) =>
    s ? new Date(s).toLocaleString('es-AR', { dateStyle: 'medium', timeStyle: 'short' }) : '';

  /* -------------------------------- Render ------------------------------- */
  return (
    <Page
      title="CRM de Mensajes"
      actions={
        <Button
          startIcon={<RefreshIcon />}
          onClick={() => {
            loadStudents(filters);
            loadKpis();
            loadNotes();
          }}
          disabled={studentsLoading || notesLoading}
        >
          Recargar
        </Button>
      }
    >
      {/* KPI strip: EXACTLY 3 across on md+; fills full width; pro framed band */}
      <Box
        sx={{
          mb: 3,
          p: { xs: 1.5, md: 2 },
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          backgroundColor: (t) => t.palette.background.paper,
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)', // lock to exactly 3
              lg: 'repeat(3, 1fr)',
              xl: 'repeat(3, 1fr)',
            },
            gap: { xs: 2, md: 3 },
            alignItems: 'stretch',
          }}
        >
          {kpiData.map((k) => (
            <Box key={k.key} sx={{ minWidth: 0, display: 'flex' }}>
              <KpiCard
                title={k.title}
                value={k.value}
                icon={k.icon}
                color={k.color}
                sx={{ width: '100%', minHeight: 152 }}
              />
            </Box>
          ))}
        </Box>
      </Box>

      {/* Filtros */}
      <Card sx={{ mb: 3 }}>
        <CardHeader title="Filtros" />
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Nombre Alumno"
                name="student_name"
                value={filters.student_name}
                onChange={(e) => setFilters((f) => ({ ...f, student_name: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Fecha Desde"
                name="start_date"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={filters.start_date}
                onChange={(e) => setFilters((f) => ({ ...f, start_date: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Fecha Hasta"
                name="end_date"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={filters.end_date}
                onChange={(e) => setFilters((f) => ({ ...f, end_date: e.target.value }))}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Two columns layout */}
      <Grid container spacing={3}>
        {/* Left: Students */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardHeader title="Alumnos" />
            <CardContent sx={{ position: 'relative', minHeight: 360 }}>
              {studentsLoading && (
                <Box sx={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
                  <CircularProgress size={24} />
                </Box>
              )}
              <StudentList
                students={students}
                onSelectStudent={setSelectedStudent}
                setStudents={setStudents}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Right: Conversation + Notes */}
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3 }}>
            <CardHeader title="Conversación" />
            <CardContent sx={{ minHeight: 280 }}>
              {selectedStudent ? (
                <ConversationView student={selectedStudent} />
              ) : (
                <Box sx={{ height: 240, display: 'grid', placeItems: 'center', color: 'text.secondary' }}>
                  Seleccioná un alumno para ver la conversación y agregar notas.
                </Box>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader
              title="Notas"
              action={
                <Button
                  variant="contained"
                  startIcon={<NoteAddIcon />}
                  onClick={openCreateNote}
                  disabled={!selectedStudent}
                >
                  Nueva nota
                </Button>
              }
            />
            <CardContent>
              {notesLoading ? (
                <Box sx={{ py: 2, display: 'grid', placeItems: 'center' }}>
                  <CircularProgress size={22} />
                </Box>
              ) : notesError ? (
                <Alert severity="error">{notesError}</Alert>
              ) : notes.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No hay notas aún.
                </Typography>
              ) : (
                <Grid container spacing={1.5}>
                  {notes.map((n) => (
                    <Grid item xs={12} key={n.id}>
                      <Card variant="outlined">
                        <CardContent sx={{ pt: 1.5, pb: 1.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
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
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Toast */}
      <Snackbar
        open={toast.open}
        autoHideDuration={2800}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setToast((t) => ({ ...t, open: false }))}
          severity={toast.severity}
          sx={{ width: '100%' }}
        >
          {toast.message}
        </Alert>
      </Snackbar>

      {/* Note Dialog */}
      <NoteDialog
        open={noteDialogOpen}
        mode={noteDialogMode}
        draft={noteDraft}
        setDraft={setNoteDraft}
        quickTags={QUICK_TAGS}
        onClose={() => setNoteDialogOpen(false)}
        onSave={saveNoteFromDialog}
        onDelete={noteDialogMode === 'edit' ? deleteNoteFromDialog : undefined}
        saving={savingNote}
      />
    </Page>
  );
}