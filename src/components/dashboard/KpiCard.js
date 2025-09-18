import React from 'react';
import { Card, Box, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';

// Compact number formatter (e.g., 12.3K)
const fmt = (v) => {
  if (v === null || v === undefined) return '—';
  if (typeof v !== 'number') return String(v);
  try {
    // use compact if numbers get large
    return new Intl.NumberFormat('es-AR', {
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(v);
  } catch {
    return v.toLocaleString('es-AR');
  }
};

/**
 * KpiCard
 * Props:
 * - title: string
 * - value: number | string
 * - icon: ReactNode (MUI icon element)
 * - color: MUI palette key ('primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error')
 * - subtitle?: string (optional small hint under the value)
 * - sx?: system styles (optional)
 */
const KpiCard = ({ title, value, icon, color = 'primary', subtitle, sx }) => {
  const theme = useTheme();
  const tone = theme.palette[color] || theme.palette.primary;

  return (
    <Card
      elevation={0}
      sx={{
        position: 'relative',
        p: 2.25,
        borderRadius: 3,
        height: '100%',
        border: '1px solid',
        borderColor: 'divider',
        boxShadow:
          theme.palette.mode === 'light'
            ? '0 6px 18px rgba(0,0,0,0.06)'
            : '0 10px 28px rgba(0,0,0,0.35)',
        transition: 'transform .12s ease, box-shadow .12s ease',
        '&:hover': {
          transform: 'translateY(-1px)',
          boxShadow:
            theme.palette.mode === 'light'
              ? '0 10px 30px rgba(0,0,0,0.10)'
              : '0 16px 40px rgba(0,0,0,0.55)',
        },
        ...sx,
      }}
    >
      {/* Accent stripe */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: `linear-gradient(90deg, ${tone.main}, ${alpha(tone.main, 0.4)})`,
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
        }}
      />

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          minWidth: 0,
          height: '100%',
        }}
      >
        {/* Text side */}
        <Box sx={{ minWidth: 0, overflow: 'hidden' }}>
          <Typography
            variant="overline"
            color="text.secondary"
            sx={{ letterSpacing: 0.6, textTransform: 'uppercase' }}
          >
            {title}
          </Typography>

          <Typography
            variant="h4"
            component="div"
            sx={{ fontWeight: 800, lineHeight: 1.1, wordBreak: 'break-word' }}
          >
            {fmt(value)}
          </Typography>

          {subtitle ? (
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          ) : null}
        </Box>

        {/* Icon tile */}
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: 2.25,
            display: 'grid',
            placeItems: 'center',
            background: `radial-gradient(circle at 30% 20%, ${alpha(
              tone.main,
              0.25
            )}, ${alpha(tone.main, 0.08)} 60%)`,
            border: '1px solid',
            borderColor: alpha(tone.main, 0.28),
            flexShrink: 0,
          }}
        >
          <Box sx={{ color: tone.main, '& svg': { fontSize: 34 } }}>{icon}</Box>
        </Box>
      </Box>
    </Card>
  );
};

export default KpiCard;