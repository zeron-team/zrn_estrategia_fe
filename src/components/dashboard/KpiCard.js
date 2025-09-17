import React from 'react';
import { Card, Typography, Box, Avatar } from '@mui/material';
import { styled, alpha, useTheme } from '@mui/material/styles';

const KpiCard = ({ title, value, icon, color = 'primary', sx }) => {
  const theme = useTheme();
  const main = theme.palette[color]?.main ?? theme.palette.primary.main;

  const StyledCard = styled(Card)(({ theme }) => ({
    height: '100%',                     // <- clave: llena el contenedor del frame
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    padding: theme.spacing(1.5, 2),
    border: `1px solid ${theme.palette.divider}`,
    boxShadow:
      theme.palette.mode === 'light'
        ? '0 6px 18px rgba(0,0,0,0.06)'
        : '0 10px 26px rgba(0,0,0,0.35)',
    backgroundColor: theme.palette.background.paper,
  }));

  const StyledAvatar = styled(Avatar)({
    width: 56,
    height: 56,
    color: main,
    backgroundColor: alpha(main, 0.12), // mejor que `${main}20` para cualquier formato
  });

  const formatNumber = (v) =>
    typeof v === 'number' ? new Intl.NumberFormat('es-AR').format(v) : v ?? '—';

  return (
    <StyledCard elevation={0} sx={sx}>
      <Box sx={{ minWidth: 0, pr: 2 }}>
        <Typography variant="subtitle2" color="text.secondary" sx={{ lineHeight: 1 }}>
          {title}
        </Typography>
        <Typography
          variant="h4"
          component="div"
          sx={{ fontWeight: 700, mt: 0.5, whiteSpace: 'nowrap' }}
          title={String(value)}
        >
          {formatNumber(value)}
        </Typography>
      </Box>

      <StyledAvatar variant="rounded" sx={{ flexShrink: 0 }}>
        {icon}
      </StyledAvatar>
    </StyledCard>
  );
};

export default KpiCard;