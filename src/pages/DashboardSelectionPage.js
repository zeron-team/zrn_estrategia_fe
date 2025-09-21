// src/pages/DashboardSelectionPage.js
import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Typography,
  useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

import DashboardIcon from '@mui/icons-material/Dashboard';
import BarChartIcon from '@mui/icons-material/BarChart';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PieChartIcon from '@mui/icons-material/PieChart';
import SchoolIcon from '@mui/icons-material/School';

const MAX_FRAME_WIDTH = 1440;

const dashboardCards = [
  {
    title: 'Dashboard de CRM',
    description: 'Vista general de métricas del CRM.',
    icon: <DashboardIcon />,
    path: '/dashboard/main',
    color: 'primary',
  },
  {
    title: 'Análisis de Notas',
    description: 'KPIs, gráficos de torta y barras de notas.',
    icon: <BarChartIcon />,
    path: '/notes?tab=analytics',
    color: 'success',
  },
  {
    title: 'Dashboard Predictivo',
    description: 'Análisis Predictivo, Riesgo por Curso',
    icon: <TrendingUpIcon />,
    path: '/dashboard/predictive',
    color: 'warning',
  },
  {
    title: 'Dashboard de Moodle 3',
    description: 'Análisis de Moodle 3',
    icon: <PieChartIcon />,
    path: '/courses',
    color: 'info',
  },
];

const DashboardSelectionPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  return (
    <Box
      sx={{
        py: { xs: 3, md: 5 },
        px: { xs: 2, md: 3 },
        background:
          theme.palette.mode === 'light'
            ? `linear-gradient(180deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`
            : theme.palette.background.default,
      }}
    >
      {/* Frame centrado y profesional */}
      <Box sx={{ maxWidth: MAX_FRAME_WIDTH, mx: 'auto' }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 1 }}>
            Dashboards
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
            Seleccioná un Dashboard
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {dashboardCards.map((card, index) => {
            const tone = theme.palette[card.color] || theme.palette.primary;
            return (
              <Grid item xs={12} sm={6} md={3} key={index} sx={{ display: 'flex' }}>
                <Card
                  elevation={0}
                  sx={{
                    position: 'relative',
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    boxShadow:
                      theme.palette.mode === 'light'
                        ? '0 6px 18px rgba(0,0,0,0.06)'
                        : '0 10px 28px rgba(0,0,0,0.35)',
                    transition: 'transform .12s ease, box-shadow .12s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow:
                        theme.palette.mode === 'light'
                          ? '0 12px 32px rgba(0,0,0,0.10)'
                          : '0 18px 42px rgba(0,0,0,0.55)',
                    },
                  }}
                >
                  {/* Franja superior de acento */}
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      height: 3,
                      background: `linear-gradient(90deg, ${tone.main}, ${alpha(tone.main, 0.4)})`,
                    }}
                  />

                  <CardActionArea
                    onClick={() => navigate(card.path)}
                    sx={{ height: '100%', display: 'flex', alignItems: 'stretch' }}
                  >
                    <CardContent
                      sx={{
                        display: 'grid',
                        gridTemplateRows: 'auto 1fr auto',
                        gap: 1,
                        width: '100%',
                        py: 3,
                      }}
                    >
                      {/* Icon tile */}
                      <Box
                        sx={{
                          width: 64,
                          height: 64,
                          borderRadius: 2.5,
                          display: 'grid',
                          placeItems: 'center',
                          background: `radial-gradient(circle at 30% 20%, ${alpha(
                            tone.main,
                            0.28
                          )}, ${alpha(tone.main, 0.10)} 60%)`,
                          border: '1px solid',
                          borderColor: alpha(tone.main, 0.3),
                          mb: 1,
                        }}
                        aria-hidden
                      >
                        <Box sx={{ color: tone.main, '& svg': { fontSize: 36 } }}>{card.icon}</Box>
                      </Box>

                      {/* Título */}
                      <Typography variant="h6" component="div" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                        {card.title}
                      </Typography>

                      {/* Descripción */}
                      <Typography variant="body2" color="text.secondary">
                        {card.description}
                      </Typography>

                      {/* “Ingresar” ghost link (estético) */}
                      <Box sx={{ mt: 1 }}>
                        <Typography
                          variant="button"
                          sx={{
                            fontSize: 12,
                            letterSpacing: 0.6,
                            color: tone.main,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 0.75,
                            opacity: 0.9,
                          }}
                        >
                          Ingresar →
                        </Typography>
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    </Box>
  );
};

export default DashboardSelectionPage;