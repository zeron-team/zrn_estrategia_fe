// src/pages/LoginPage.js

import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Container, TextField, Typography, Paper, Alert } from '@mui/material';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const auth = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await auth.login(username, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Credenciales incorrectas. Por favor, intente de nuevo.');
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={6} sx={{ mt: 8, p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">
          CRM Chatbot - Moodle
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField margin="normal" required fullWidth id="username" label="Usuario" name="username" autoFocus value={username} onChange={(e) => setUsername(e.target.value)} />
          <TextField margin="normal" required fullWidth name="password" label="Contraseña" type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          {error && <Alert severity="error" sx={{ width: '100%', mt: 2 }}>{error}</Alert>}
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
            Ingresar
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default LoginPage;