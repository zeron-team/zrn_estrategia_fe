import React from 'react';
import { Box, Typography } from '@mui/material';

const SalesDashboardPage = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard de Ventas
      </Typography>
      <Typography variant="body1">
        Aquí se mostrarán las métricas y análisis relacionados con las ventas.
      </Typography>
    </Box>
  );
};

export default SalesDashboardPage;
