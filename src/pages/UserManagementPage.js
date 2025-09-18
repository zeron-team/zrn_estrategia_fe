import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  Toolbar,
  Tooltip,
  CircularProgress,
  Alert,
  useTheme,
} from '@mui/material';
import { Edit, Delete, Refresh } from '@mui/icons-material';

import { getUsers, createUser, updateUser, deleteUser } from '../services/userApi';

const MAX_FRAME_WIDTH = 1440;

const UserManagementPage = () => {
  const theme = useTheme();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [open, setOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    lastname: '',
    username: '',
    email: '',
    phone_number: '',
    password: '',
    repeat_password: '',
  });

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getUsers();
      setUsers(response.data || []);
    } catch (e) {
      console.error('Error fetching users:', e);
      setError('No pudimos cargar los usuarios. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpen = (user = null) => {
    setCurrentUser(user);
    setFormData(
      user
        ? { ...user, password: '', repeat_password: '' }
        : {
            name: '',
            lastname: '',
            username: '',
            email: '',
            phone_number: '',
            password: '',
            repeat_password: '',
          }
    );
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setCurrentUser(null);
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const passwordsMatch = formData.password === formData.repeat_password;
  const emailValid = !formData.email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
  const canSubmit =
    !!formData.name &&
    !!formData.username &&
    !!formData.email &&
    emailValid &&
    (currentUser ? true : !!formData.password) &&
    passwordsMatch;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSaving(true);
    try {
      if (currentUser) {
        await updateUser(currentUser.id, formData);
      } else {
        await createUser(formData);
      }
      await fetchUsers();
      handleClose();
    } catch (e) {
      console.error('Error saving user:', e);
      setError('No se pudo guardar el usuario.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('¿Seguro que querés eliminar este usuario?')) return;
    try {
      await deleteUser(userId);
      fetchUsers();
    } catch (e) {
      console.error('Error deleting user:', e);
      setError('No se pudo eliminar el usuario.');
    }
  };

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
          <Toolbar disableGutters sx={{ justifyContent: 'space-between', mb: 2 }}>
            <Box>
              <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 1 }}>
                Administración
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                Usuarios
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Recargar">
                <IconButton onClick={fetchUsers}>
                  <Refresh />
                </IconButton>
              </Tooltip>
              <Button variant="contained" onClick={() => handleOpen()}>
                Crear Usuario
              </Button>
            </Box>
          </Toolbar>

          {error && (
            <Box sx={{ mb: 2 }}>
              <Alert severity="error" onClose={() => setError(null)}>
                {error}
              </Alert>
            </Box>
          )}

          {/* Table */}
          <TableContainer
            component={Paper}
            variant="outlined"
            sx={{ borderRadius: 2, overflow: 'hidden' }}
          >
            {loading ? (
              <Box sx={{ display: 'grid', placeItems: 'center', py: 6 }}>
                <CircularProgress size={24} />
              </Box>
            ) : users.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  No hay usuarios todavía.
                </Typography>
                <Button variant="contained" onClick={() => handleOpen()}>
                  Crear el primero
                </Button>
              </Box>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Nombre</TableCell>
                    <TableCell>Apellido</TableCell>
                    <TableCell>Usuario</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Teléfono</TableCell>
                    <TableCell align="right">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.id} hover>
                      <TableCell>{u.name}</TableCell>
                      <TableCell>{u.lastname}</TableCell>
                      <TableCell>{u.username}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>{u.phone_number}</TableCell>
                      <TableCell align="right">
                        <Tooltip title="Editar">
                          <IconButton size="small" onClick={() => handleOpen(u)}>
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar">
                          <IconButton size="small" onClick={() => handleDelete(u.id)}>
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TableContainer>
        </Paper>
      </Box>

      {/* Dialog */}
      <Dialog open={open} onClose={saving ? undefined : handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{currentUser ? 'Editar Usuario' : 'Crear Usuario'}</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'grid', gap: 1.5, mt: 0.5 }}>
            <TextField name="name" label="Nombre" value={formData.name} onChange={handleChange} fullWidth />
            <TextField name="lastname" label="Apellido" value={formData.lastname} onChange={handleChange} fullWidth />
            <TextField name="username" label="Usuario" value={formData.username} onChange={handleChange} fullWidth />
            <TextField
              name="email"
              label="Email"
              value={formData.email}
              onChange={handleChange}
              fullWidth
              error={!!formData.email && !emailValid}
              helperText={!emailValid ? 'Email inválido' : ' '}
            />
            <TextField name="phone_number" label="Teléfono" value={formData.phone_number} onChange={handleChange} fullWidth />
            <TextField
              name="password"
              label="Contraseña"
              type="password"
              value={formData.password}
              onChange={handleChange}
              fullWidth
              helperText={currentUser ? 'Dejar vacío para mantener' : ' '}
            />
            <TextField
              name="repeat_password"
              label="Repetir Contraseña"
              type="password"
              value={formData.repeat_password}
              onChange={handleChange}
              fullWidth
              error={!!formData.repeat_password && !passwordsMatch}
              helperText={!passwordsMatch ? 'Las contraseñas no coinciden' : ' '}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={saving}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={!canSubmit || saving}>
            {saving ? 'Guardando…' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagementPage;