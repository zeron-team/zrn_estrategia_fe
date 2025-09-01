// src/components/dashboard/KpiCard.js

import React from 'react';
import { Paper, Typography, Box } from '@mui/material';

const KpiCard = ({ title, value, icon, color = 'primary' }) => {
  return (
    <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Box>
        <Typography variant="h6" color="textSecondary" gutterBottom>
          {title}
        </Typography>
        <Typography variant="h4" component="div" color={`${color}.main`}>
          {value}
        </Typography>
      </Box>
      <Box sx={{ color: `${color}.main`, fontSize: 40 }}>
        {icon}
      </Box>
    </Paper>
  );
};

export default KpiCard;