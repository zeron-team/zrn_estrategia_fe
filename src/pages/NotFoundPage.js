// src/pages/NotFoundPage.js

import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        textAlign: 'center',
      }}
    >
      <Typography variant="h1" component="h1" gutterBottom>
        404
      </Typography>
      <Typography variant="h5" component="h2" gutterBottom>
        Página no encontrada
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        La página que buscas no existe o ha sido movida.
      </Typography>
      <Button component={Link} to="/dashboard" variant="contained">
        Volver al Dashboard
      </Button>
    </Box>
  );
};

export default NotFoundPage;