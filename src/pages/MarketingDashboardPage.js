import React from 'react';
import { Box, Typography } from '@mui/material';

const MarketingDashboardPage = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard de Marketing
      </Typography>
      <Typography variant="body1">
        Aquí se mostrarán las métricas y análisis relacionados con el marketing.
      </Typography>
    </Box>
  );
};

export default MarketingDashboardPage;
