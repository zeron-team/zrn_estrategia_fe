import React from 'react';
import { Box, Typography } from '@mui/material';

const SupportDashboardPage = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard de Soporte
      </Typography>
      <Typography variant="body1">
        Aquí se mostrarán las métricas y análisis relacionados con el soporte al cliente.
      </Typography>
    </Box>
  );
};

export default SupportDashboardPage;
