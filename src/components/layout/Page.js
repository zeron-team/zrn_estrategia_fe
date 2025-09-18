import React from 'react';
import { Box, Typography } from '@mui/material';

export default function Page({ title, actions, children, maxWidth = 1440 }) {
  return (
    <Box sx={{ flexGrow: 1, p: { xs: 2, md: 3 } }}>
      <Box sx={{ maxWidth, mx: 'auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h4" component="h1">{title}</Typography>
          {actions ?? null}
        </Box>
        {children}
      </Box>
    </Box>
  );
}