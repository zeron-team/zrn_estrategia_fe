import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  IconButton,
  useTheme,
  Container,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import PeopleIcon from '@mui/icons-material/People';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import ForumIcon from '@mui/icons-material/Forum';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';

import MainLayout from '../components/layout/MainLayout';
import KpiCard from '../components/dashboard/KpiCard';
import TimelineChart from '../components/dashboard/TimelineChart';
import CrmActionsChart from '../components/dashboard/CrmActionsChart';
import apiClient from '../api/client';

// Dimensiones y ritmo visual
const MAX_FRAME_WIDTH = 1440; // px (tamaño pro, tipo "container-xl")
const GAP = 16;               // px entre tarjetas
const KPI_CARD_HEIGHT = 140;  // altura uniforme KPIs
const CHART_CARD_HEIGHT = 440; // altura uniforme charts

const DashboardPage = () => {
  const theme = useTheme();

  const [kpis, setKpis] = useState(null);
  const [messageKpis, setMessageKpis] = useState({
    total_messages: 0,
    inbound_count: 0,
    outbound_count: 0,
  });
  const [timelineData, setTimelineData] = useState([]);
  const [crmCounts, setCrmCounts] = useState({
    case_taken_count: 0,
    manual_contact_count: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    try {
      setError(null);
      setLoading(true);

      const [kpisRes, timelineRes, msgKpisRes, crmRes] = await Promise.all([
        apiClient.get('/api/kpis'),
        apiClient.get('/api/messages/timeline'),
        apiClient.get('/api/messages/kpis'),
        apiClient.get('/api/crm/action_counts'),
      ]);

      setKpis({
        total_contacted: kpisRes?.data?.total_contacted ?? 0,
        approved: kpisRes?.data?.approved ?? 0,
        disapproved: kpisRes?.data?.disapproved ?? 0,
      });

      setTimelineData(Array.isArray(timelineRes?.data) ? timelineRes.data : []);

      const mk = msgKpisRes?.data || {};
      setMessageKpis({
        total_messages: mk.total_messages ?? 0,
        inbound_count: mk.inbound_count ?? 0,
        outbound_count: mk.outbound_count ?? 0,
      });

      setCrmCounts({
        case_taken_count: crmRes?.data?.case_taken_count ?? 0,
        manual_contact_count: crmRes?.data?.manual_contact_count ?? 0,
      });
    } catch (e) {
      console.error('Error al cargar el dashboard', e);
      setError('Error al cargar los datos del dashboard. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Datos derivados
  const studentKpis = useMemo(
    () => [
      { key: 'alumnos', title: 'Alumnos Totales', value: kpis?.total_contacted ?? 0, icon: <PeopleIcon /> },
      { key: 'aprobados', title: 'Exámenes Aprobados', value: kpis?.approved ?? 0, icon: <ThumbUpIcon />, color: 'success' },
      { key: 'desaprobados', title: 'Exámenes Desaprobados', value: kpis?.disapproved ?? 0, icon: <ThumbDownIcon />, color: 'error' },
    ],
    [kpis]
  );

  const messageKpiData = useMemo(
    () => [
      { key: 'total-msg', title: 'Total Mensajes', value: messageKpis.total_messages, icon: <ForumIcon /> },
      { key: 'inbound', title: 'Mensajes Entrantes', value: messageKpis.inbound_count, icon: <ArrowDownwardIcon />, color: 'info' },
      { key: 'outbound', title: 'Mensajes Salientes', value: messageKpis.outbound_count, icon: <ArrowUpwardIcon />, color: 'secondary' },
    ],
    [messageKpis]
  );

  const crmDataset = useMemo(
    () => [
      { name: 'Tomar Caso', value: crmCounts.case_taken_count ?? 0, color: theme.palette.primary.main },
      { name: 'Contacto Manual', value: crmCounts.manual_contact_count ?? 0, color: theme.palette.secondary.main },
    ],
    [crmCounts, theme]
  );

  if (loading) {
    return (
      <MainLayout>
        <Box sx={{ display: 'grid', placeItems: 'center', height: '70vh' }}>
          <Box sx={{ display: 'grid', gap: 8, justifyItems: 'center' }}>
            <CircularProgress />
            <Typography variant="body2" color="text.secondary">Cargando dashboard…</Typography>
          </Box>
        </Box>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <Container maxWidth={false} disableGutters>
          <Box sx={{ p: 2 }}>
            <Alert
              severity="error"
              action={
                <IconButton aria-label="recargar" color="inherit" size="small" onClick={loadData}>
                  <RefreshIcon fontSize="inherit" />
                </IconButton>
              }
            >
              {error}
            </Alert>
          </Box>
        </Container>
      </MainLayout>
    );
  }

  // Helper grid column spans
  const colSpanKPI = { xs: 'span 12', sm: 'span 6', md: 'span 4' }; // 3 col en md+
  const colSpanChart = { xs: 'span 12', lg: 'span 6' };              // 2 col en lg+

  return (
    <MainLayout>
      {/* Cinta de fondo para realzar el frame */}
      <Box
        sx={{
          py: { xs: 2, md: 4 },
          px: { xs: 2, md: 3 },
          background:
            theme.palette.mode === 'light'
              ? `linear-gradient(180deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`
              : `linear-gradient(180deg, ${theme.palette.background.default} 0%, ${theme.palette.background.default} 100%)`,
        }}
      >
        {/* FRAME profesional centrado */}
        <Box sx={{ maxWidth: MAX_FRAME_WIDTH, mx: 'auto' }}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, md: 3.5 },
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              boxShadow:
                theme.palette.mode === 'light'
                  ? '0 6px 24px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)'
                  : '0 10px 30px rgba(0,0,0,0.35)',
              backgroundColor: theme.palette.background.paper,
            }}
          >
            {/* Header del frame */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 3,
              }}
            >
              <Box>
                <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 1 }}>
                  Panel
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                  Dashboard de Interacciones
                </Typography>
              </Box>
              <IconButton aria-label="recargar" onClick={loadData} size="large">
                <RefreshIcon />
              </IconButton>
            </Box>

            {/* GRID dentro del frame (12 columnas) */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(12, minmax(0, 1fr))',
                gap: `${GAP}px`,
              }}
            >
              {/* Línea 1: 3 KPIs */}
                {studentKpis.map((kpi) => (
                <Box key={kpi.key} sx={{ gridColumn: colSpanKPI, minWidth: 0 }}>
                    <Box sx={{ height: KPI_CARD_HEIGHT, width: '100%' }}>
                    <KpiCard
                        title={kpi.title}
                        value={kpi.value}
                        icon={kpi.icon}
                        color={kpi.color}
                        sx={{ height: '100%' }}        // <- KPI llena el alto del contenedor
                    />
                    </Box>
                </Box>
                ))}

              {/* Línea 2: 3 KPIs */}
                {messageKpiData.map((kpi) => (
                <Box key={kpi.key} sx={{ gridColumn: colSpanKPI, minWidth: 0 }}>
                    <Box sx={{ height: KPI_CARD_HEIGHT, width: '100%' }}>
                    <KpiCard
                        title={kpi.title}
                        value={kpi.value}
                        icon={kpi.icon}
                        color={kpi.color}
                        sx={{ height: '100%' }}
                    />
                    </Box>
                </Box>
                ))}

              {/* Línea 3: 2 charts (50/50 del frame) */}
              <Box sx={{ gridColumn: colSpanChart, minWidth: 0 }}>
                <Paper
                  elevation={1}
                  sx={{
                    p: 2.5,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    height: CHART_CARD_HEIGHT,
                    display: 'flex',
                    flexDirection: 'column',
                    width: '100%',
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Mensajes por día
                  </Typography>
                  <Box sx={{ flex: 1, minHeight: 0, width: '100%' }}>
                    <TimelineChart data={timelineData} color={theme.palette.primary.main} />
                  </Box>
                </Paper>
              </Box>

              <Box sx={{ gridColumn: colSpanChart, minWidth: 0 }}>
                <Paper
                  elevation={1}
                  sx={{
                    p: 2.5,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    height: CHART_CARD_HEIGHT,
                    display: 'flex',
                    flexDirection: 'column',
                    width: '100%',
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Acciones CRM
                  </Typography>
                  <Box sx={{ flex: 1, minHeight: 0, width: '100%' }}>
                    <CrmActionsChart data={crmDataset} />
                  </Box>
                </Paper>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Box>
    </MainLayout>
  );
};

export default DashboardPage;