import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Skeleton,
  Alert,
  useTheme,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import CloseIcon from '@mui/icons-material/Close';

import { getFlows, createFlow, updateFlow, deleteFlow, setActiveFlow } from '../services/flowApi';

import FlowList from '../components/flows/FlowList';
import FlowEditor from '../components/flows/FlowEditor';
import FlowDiagram from '../components/flows/FlowDiagram';

const MAX_FRAME_WIDTH = 1440;
const GAP = 16;

const FlowsPage = () => {
  const theme = useTheme();

  const [flows, setFlows] = useState([]);
  const [editingFlow, setEditingFlow] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [viewingFlow, setViewingFlow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const loadFlows = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getFlows();
      setFlows(response?.data || []);
    } catch (e) {
      console.error('Error al cargar los flujos:', e);
      setError('No pudimos cargar los flujos. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFlows();
  }, []);

  const handleCreate = () => {
    setEditingFlow(null);
    setIsFormOpen(true);
  };

  const handleEdit = (flow) => {
    setEditingFlow(flow);
    setIsFormOpen(true);
  };

  const handleDelete = async (flowId) => {
    try {
      await deleteFlow(flowId);
      loadFlows();
    } catch (e) {
      console.error('Error al eliminar el flujo:', e);
      setError('No pudimos eliminar el flujo.');
    }
  };

  const handleSave = async (flowData) => {
    try {
      setSaving(true);
      if (editingFlow) {
        await updateFlow(editingFlow.id, flowData);
      } else {
        await createFlow(flowData);
      }
      setIsFormOpen(false);
      setEditingFlow(null);
      loadFlows();
    } catch (e) {
      console.error('Error al guardar el flujo:', e);
      setError('No pudimos guardar el flujo.');
    } finally {
      setSaving(false);
    }
  };

  const handleSetActive = async (flowId) => {
    try {
      await setActiveFlow(flowId);
      loadFlows();
    } catch (e) {
      console.error('Error al activar el flujo:', e);
      setError('No pudimos activar el flujo.');
    }
  };

  const handleViewDiagram = (flow) => setViewingFlow(flow);
  const handleCloseDiagram = () => setViewingFlow(null);

  const ListSkeleton = () => (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
        Flujos
      </Typography>
      <Box sx={{ display: 'grid', gap: 1.25 }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Skeleton variant="rectangular" width={28} height={28} sx={{ borderRadius: 1 }} />
            <Skeleton variant="text" width="40%" />
            <Skeleton variant="text" width="18%" />
          </Box>
        ))}
      </Box>
    </Paper>
  );

  return (
    <Box
      sx={{
        flexGrow: 1,
        py: { xs: 2, md: 3 },
        px: { xs: 2, md: 3 },
        background:
          theme.palette.mode === 'light'
            ? `linear-gradient(180deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`
            : theme.palette.background.default,
      }}
    >
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
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, minWidth: 0 }}>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 1 }}>
                Flujos
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                Flujos de Conversación
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                startIcon={<RefreshIcon />}
                onClick={loadFlows}
                variant="outlined"
              >
                Recargar
              </Button>
              <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
                Crear Nuevo Flujo
              </Button>
            </Box>
          </Box>

          {error && (
            <Box sx={{ mb: 2 }}>
              <Alert severity="error" onClose={() => setError(null)}>
                {error}
              </Alert>
            </Box>
          )}

          {/* Content */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: `${GAP}px`,
              alignItems: 'stretch',
              minWidth: 0,
            }}
          >
            {isFormOpen ? (
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  overflow: 'hidden',
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  {editingFlow ? 'Editar Flujo' : 'Crear Flujo'}
                </Typography>
                <FlowEditor
                  flow={editingFlow}
                  onSave={handleSave}
                  onCancel={() => {
                    setIsFormOpen(false);
                    setEditingFlow(null);
                  }}
                  saving={saving}
                />
              </Paper>
            ) : loading ? (
              <ListSkeleton />
            ) : flows.length === 0 ? (
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  textAlign: 'center',
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  No se encontraron flujos
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Crea tu primer flujo para empezar a automatizar conversaciones.
                </Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
                  Crear Nuevo Flujo
                </Button>
              </Paper>
            ) : (
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  overflow: 'hidden',
                  minWidth: 0,
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Flujos
                </Typography>
                <FlowList
                  flows={flows}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onViewDiagram={handleViewDiagram}
                  onSetActive={handleSetActive}
                />
              </Paper>
            )}
          </Box>
        </Paper>
      </Box>

      {/* Diagram dialog */}
      <Dialog
        open={!!viewingFlow}
        onClose={handleCloseDiagram}
        fullWidth
        maxWidth="xl"
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            pr: 1,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {viewingFlow?.name || 'Diagrama de Flujo'}
          </Typography>
          <IconButton onClick={handleCloseDiagram}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ p: 0 }}>
          <Box sx={{ p: 2 }}>
            <Box sx={{ height: '70vh', width: '100%', minWidth: 0 }}>
              <FlowDiagram flow={viewingFlow} />
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDiagram}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FlowsPage;