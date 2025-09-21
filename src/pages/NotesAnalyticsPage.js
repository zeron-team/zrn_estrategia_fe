// src/pages/NotesAnalyticsPage.js
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Button,
  ButtonGroup,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';

import AssessmentIcon from '@mui/icons-material/Assessment';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';

import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

import Page from '../components/layout/Page';
import KpiCard from '../components/dashboard/KpiCard';
import { getNotesAnalyticsKpis, getCourseDetailsForMonth, getBucketDetails } from '../services/analyticsApi';

// ---- Helpers ----
const STATUS_LABEL = {
  PASSED: 'Aprobadas',
  FAILED: 'Reprobadas',
  ABSENT: 'Ausentes',
};

const rowTotal = (r) =>
  (Number(r?.PASSED) || 0) + (Number(r?.FAILED) || 0) + (Number(r?.ABSENT) || 0);

const prettyMonth = (period) => {
  if (!period) return '';
  const [y, m] = String(period).split('-');
  const d = new Date(Number(y), Number(m) - 1, 1);
  return d.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
};
const shortMonth = (period) => {
  if (!period) return '';
  const [y, m] = String(period).split('-');
  const d = new Date(Number(y), Number(m) - 1, 1);
  return d.toLocaleDateString('es-AR', { month: 'short', year: 'numeric' });
};

export default function NotesAnalyticsPage() {
  const theme = useTheme();

  // ---------- State ----------
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Drill-down by month
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [courseData, setCourseData] = useState(null);
  const [courseLoading, setCourseLoading] = useState(false);
  const [showDrillDown, setShowDrillDown] = useState(false);
  const [courseLimit, setCourseLimit] = useState(20);

  // NEW: Drill-down for bucket
  const [bucketDialogOpen, setBucketDialogOpen] = useState(false);
  const [bucketDialogLoading, setBucketDialogLoading] = useState(false);
  const [bucketDialogTitle, setBucketDialogTitle] = useState('');
  const [bucketRows, setBucketRows] = useState([]);

  // Colors
  const STATUS_COLOR = useMemo(
    () => ({
      PASSED: theme.palette.success.main,
      FAILED: theme.palette.error.main,
      ABSENT: theme.palette.warning.main,
      MIXED: theme.palette.info.main,
    }),
    [theme.palette]
  );

  const PIE_COLORS = useMemo(
    () => [
      STATUS_COLOR.PASSED,
      STATUS_COLOR.FAILED,
      STATUS_COLOR.ABSENT,
      theme.palette.info.main,
      theme.palette.primary.main,
    ],
    [STATUS_COLOR, theme.palette.info.main, theme.palette.primary.main]
  );

  // ---------- Fetchers ----------
  const fetchKpis = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getNotesAnalyticsKpis();
      setKpis(data || {});
    } catch (err) {
      console.error(err);
      setError('Error al cargar los datos de análisis de notas.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCourseDetails = useCallback(
    async (month, limit) => {
      if (!month) return;
      try {
        setCourseLoading(true);
        setError(null);
        const details = await getCourseDetailsForMonth(month, limit === 'all' ? null : limit);
        let arr = Array.isArray(details) ? [...details] : [];
        arr.sort((a, b) => rowTotal(b) - rowTotal(a));
        if (limit !== 'all') {
          const n = Number(limit) || 20;
          arr = arr.slice(0, n);
        }
        setCourseData(arr);
      } catch (err) {
        console.error(err);
        setError(`Error al cargar los detalles de curso para ${month}.`);
      } finally {
        setCourseLoading(false);
      }
    },
    []
  );

  // ---------- Effects ----------
  useEffect(() => { fetchKpis(); }, [fetchKpis]);
  useEffect(() => {
    if (showDrillDown && selectedMonth) fetchCourseDetails(selectedMonth, courseLimit);
  }, [showDrillDown, selectedMonth, courseLimit, fetchCourseDetails]);

  // ---------- Derived ----------
  const totalNotes = kpis?.total_notes ?? 0;
  const notesByStatus = kpis?.notes_by_status || {};
  const barChartData = kpis?.notes_by_status_over_time || [];

  const pieChartData = useMemo(
    () =>
      Object.entries(notesByStatus).map(([status, value]) => ({
        name: STATUS_LABEL[status] || status,
        key: status,
        value: Number(value) || 0,
      })),
    [notesByStatus]
  );

  // Buckets (from backend keys)
  const rawBuckets =
    kpis?.student_failure_absence_buckets ||
    kpis?.failure_absence_buckets ||
    kpis?.buckets ||
    null;

  const bucketData = useMemo(() => {
    if (!rawBuckets) return null;

    // map backend keys -> UI label + color
    const S = {
      fail_1_same_course: { label: 'Reprobó 1 vez (mismo curso)', color: STATUS_COLOR.FAILED },
      fail_2_same_course: { label: 'Reprobó 2 veces (mismo curso)', color: STATUS_COLOR.FAILED },
      fail_gt_2_same_course: { label: 'Reprobó >2 veces (mismo curso)', color: STATUS_COLOR.FAILED },
      absent_1_same_course: { label: 'Ausente 1 vez (mismo curso)', color: STATUS_COLOR.ABSENT },
      absent_2_same_course: { label: 'Ausente 2 veces (mismo curso)', color: STATUS_COLOR.ABSENT },
      absent_1_fail_1_same_course: { label: 'Ausente 1 + Reprobó 1 (mismo curso)', color: STATUS_COLOR.MIXED },
      absent_gt_1_fail_gt_1_same_course: { label: 'Ausente >1 + Reprobó >1 (mismo curso)', color: STATUS_COLOR.MIXED },
    };

    return Object.keys(S).map((key) => ({
      key,
      label: S[key].label,
      value: Number(rawBuckets?.[key]) || 0,
      color: S[key].color,
    }));
  }, [rawBuckets, STATUS_COLOR]);

  // ---------- Handlers ----------
  const handleBarClick = (data) => {
    const period = data?.payload?.period || data?.activeLabel || data?.period || data?.label || null;
    if (period) {
      const initialLimit = 20;
      setSelectedMonth(period);
      setCourseLimit(initialLimit);
      setShowDrillDown(true);
      fetchCourseDetails(period, initialLimit);
    }
  };

  const handleBackClick = () => {
    setSelectedMonth(null);
    setCourseData(null);
    setShowDrillDown(false);
    setCourseLimit(20);
    setError(null);
  };

  const handleChangeLimit = (newLimit) => {
    setCourseLimit(newLimit);
    if (showDrillDown && selectedMonth) fetchCourseDetails(selectedMonth, newLimit);
  };

  // Bucket click -> dialog
  const openBucketDialog = async (bucketItem) => {
    setBucketDialogTitle(bucketItem.label);
    setBucketDialogOpen(true);
    setBucketDialogLoading(true);
    try {
      const rows = await getBucketDetails(bucketItem.key);
      setBucketRows(Array.isArray(rows) ? rows : []);
    } catch (e) {
      console.error(e);
      setBucketRows([]);
    } finally {
      setBucketDialogLoading(false);
    }
  };

  // ---------- Tooltip styles ----------
  const tooltipContentStyle = {
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: 8,
    boxShadow:
      theme.palette.mode === 'light'
        ? '0 6px 24px rgba(0,0,0,0.06)'
        : '0 10px 30px rgba(0,0,0,0.35)',
  };
  const tooltipLabelStyle = {
    color: theme.palette.grey[800],
    fontWeight: 700,
  };
  const tooltipItemStyle = { color: theme.palette.text.secondary };

  // ---------- Render ----------
  return (
    <Page
      title="Análisis de Notas"
      actions={
        !showDrillDown ? (
          <Button onClick={fetchKpis} disabled={loading} sx={{ fontWeight: 600 }}>
            Recargar
          </Button>
        ) : (
          <Button
            startIcon={<ArrowBackIosNewIcon />}
            onClick={handleBackClick}
            disabled={courseLoading}
            sx={{ fontWeight: 600 }}
          >
            Volver a la Vista General
          </Button>
        )
      }
    >
      {loading ? (
        <Box sx={{ display: 'grid', placeItems: 'center', height: 240 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : !kpis ? (
        <Alert severity="info">No hay datos disponibles.</Alert>
      ) : (
        <>
          {/* KPIs */}
          <Box
            sx={{
              mb: 3,
              p: { xs: 1.5, md: 2 },
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              backgroundColor: (t) => t.palette.background.paper,
            }}
          >
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                gap: { xs: 2, md: 3 },
                alignItems: 'stretch',
              }}
            >
              {[
                { key: 'total', title: 'Total de Notas', value: totalNotes, icon: <AssessmentIcon />, color: 'primary' },
                { key: 'passed', title: 'Aprobadas', value: notesByStatus.PASSED ?? 0, icon: <CheckCircleOutlineIcon />, color: 'success' },
                { key: 'failed', title: 'Reprobadas', value: notesByStatus.FAILED ?? 0, icon: <HighlightOffIcon />, color: 'error' },
              ].map((k) => (
                <Box key={k.key} sx={{ minWidth: 0, display: 'flex' }}>
                  <KpiCard title={k.title} value={k.value} icon={k.icon} color={k.color} sx={{ width: '100%', minHeight: 152 }} />
                </Box>
              ))}
            </Box>
          </Box>

          {!showDrillDown ? (
            <>
              {/* Top charts (2 side-by-side) */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
                  gap: { xs: 2, md: 3 },
                  alignItems: 'stretch',
                }}
              >
                {/* Pie */}
                <Box sx={{ minWidth: 0 }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      border: '1px solid',
                      borderColor: 'divider',
                      boxShadow:
                        theme.palette.mode === 'light'
                          ? '0 6px 24px rgba(0,0,0,0.06)'
                          : '0 10px 30px rgba(0,0,0,0.35)',
                      height: { xs: 360, md: 420 },
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <Typography variant="h6" component="span" sx={{ fontWeight: 700, mb: 1 }}>
                      Distribución de Notas por Estado
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Proporción de estados sobre el total de notas.
                    </Typography>

                    <Box sx={{ flex: 1, minHeight: 0 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieChartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={120}
                            dataKey="value"
                            nameKey="name"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {pieChartData.map((entry, idx) => (
                              <Cell key={entry.key} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={tooltipContentStyle} labelStyle={tooltipLabelStyle} itemStyle={tooltipItemStyle} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>
                  </Paper>
                </Box>

                {/* Time bars */}
                <Box sx={{ minWidth: 0 }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      border: '1px solid',
                      borderColor: 'divider',
                      boxShadow:
                        theme.palette.mode === 'light'
                          ? '0 6px 24px rgba(0,0,0,0.06)'
                          : '0 10px 30px rgba(0,0,0,0.35)',
                      height: { xs: 360, md: 420 },
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <Typography variant="h6" component="span" sx={{ fontWeight: 700, mb: 1 }}>
                      Notas por Estado en el Tiempo
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Hacé clic en una barra para ver el detalle por cursos del mes.
                    </Typography>

                    <Box sx={{ flex: 1, minHeight: 0 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={barChartData} margin={{ top: 16, right: 24, left: 8, bottom: 8 }} onClick={handleBarClick}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="period"
                            stroke={theme.palette.grey[700]}
                            tick={{ fill: theme.palette.grey[700] }}
                            tickFormatter={shortMonth}
                          />
                          <YAxis stroke={theme.palette.grey[700]} tick={{ fill: theme.palette.grey[700] }} />
                          <Tooltip
                            labelFormatter={(label) => prettyMonth(label)}
                            contentStyle={tooltipContentStyle}
                            labelStyle={tooltipLabelStyle}
                            itemStyle={tooltipItemStyle}
                          />
                          <Legend />
                          <Bar dataKey="PASSED" stackId="a" name="Aprobadas" fill={STATUS_COLOR.PASSED} cursor="pointer" />
                          <Bar dataKey="FAILED" stackId="a" name="Reprobadas" fill={STATUS_COLOR.FAILED} cursor="pointer" />
                          <Bar dataKey="ABSENT" stackId="a" name="Ausentes" fill={STATUS_COLOR.ABSENT} cursor="pointer" />
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                  </Paper>
                </Box>
              </Box>

              {/* Buckets (clickable) */}
              <Box sx={{ mt: { xs: 2, md: 3 } }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                    boxShadow:
                      theme.palette.mode === 'light'
                        ? '0 6px 24px rgba(0,0,0,0.06)'
                        : '0 10px 30px rgba(0,0,0,0.35)',
                    height: 420,
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <Typography variant="h6" component="span" sx={{ fontWeight: 700, mb: 1 }}>
                    Reincidencias y Ausencias por Alumno (mismo curso)
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Hacé clic en una barra para ver la lista de alumnos y cursos.
                  </Typography>

                  <Box sx={{ flex: 1, minHeight: 0, position: 'relative' }}>
                    {!bucketData ? (
                      <Box sx={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
                        <Alert severity="info" sx={{ maxWidth: 640, textAlign: 'center' }}>
                          No se encontraron datos de buckets en el payload de KPIs.
                          Exponé <code>student_failure_absence_buckets</code> o <code>failure_absence_buckets</code> en la API.
                        </Alert>
                      </Box>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={bucketData} layout="vertical" margin={{ top: 16, right: 24, left: 24, bottom: 16 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" stroke={theme.palette.grey[700]} tick={{ fill: theme.palette.grey[700] }} />
                          <YAxis
                            type="category"
                            dataKey="label"
                            width={360}
                            stroke={theme.palette.grey[700]}
                            tick={{ fill: theme.palette.grey[700], fontSize: 12, fontWeight: 600 }}
                          />
                          <Tooltip
                            labelFormatter={(label) => label}
                            formatter={(value) => [value, 'Alumnos']}
                            contentStyle={tooltipContentStyle}
                            labelStyle={tooltipLabelStyle}
                            itemStyle={tooltipItemStyle}
                          />
                          <Legend />
                          <Bar dataKey="value" name="Alumnos">
                            {bucketData.map((item) => (
                              <Cell
                                key={item.key}
                                fill={item.color}
                                cursor="pointer"
                                onClick={() => openBucketDialog(item)}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </Box>
                </Paper>
              </Box>
            </>
          ) : (
            // Drill-down por mes
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                <Button startIcon={<ArrowBackIosNewIcon />} onClick={handleBackClick} disabled={courseLoading}>
                  Volver a la Vista General
                </Button>

                <Chip
                  label={`Mes: ${prettyMonth(selectedMonth)}`}
                  size="small"
                  sx={{
                    fontWeight: 600,
                    textTransform: 'capitalize',
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                    color: theme.palette.primary.main,
                  }}
                />

                <Box sx={{ flex: 1 }} />

                <ButtonGroup variant="outlined" aria-label="course limit buttons" sx={{ flexWrap: 'wrap' }}>
                  {[20, 30, 40, 50].map((n) => (
                    <Button key={`limit-${n}`} onClick={() => handleChangeLimit(n)} disabled={courseLimit === n}>
                      Top {n}
                    </Button>
                  ))}
                  <Button onClick={() => handleChangeLimit('all')} disabled={courseLimit === 'all'}>
                    Todos
                  </Button>
                </ButtonGroup>
              </Box>

              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: 'divider',
                  boxShadow:
                    theme.palette.mode === 'light'
                      ? '0 6px 24px rgba(0,0,0,0.06)'
                      : '0 10px 30px rgba(0,0,0,0.35)',
                  height: 560,
                  position: 'relative',
                }}
              >
                {courseLoading ? (
                  <Box sx={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
                    <CircularProgress />
                  </Box>
                ) : !courseData || courseData.length === 0 ? (
                  <Alert severity="info">
                    No hay datos de cursos disponibles para {prettyMonth(selectedMonth)} con el límite actual.
                  </Alert>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={courseData} layout="vertical" margin={{ top: 16, right: 24, left: 24, bottom: 16 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" stroke={theme.palette.grey[700]} tick={{ fill: theme.palette.grey[700] }} />
                      <YAxis
                        type="category"
                        dataKey="course_name"
                        width={260}
                        stroke={theme.palette.grey[700]}
                        tick={{ fill: theme.palette.grey[700], fontSize: 12, fontWeight: 600 }}
                        tickFormatter={(v) => (v?.length > 28 ? `${v.slice(0, 28)}…` : v)}
                      />
                      <Tooltip
                        labelFormatter={(_, payload) => payload?.[0]?.payload?.course_name || ''}
                        formatter={(value, key) => [value, STATUS_LABEL[key] || key]}
                        contentStyle={tooltipContentStyle}
                        labelStyle={tooltipLabelStyle}
                        itemStyle={tooltipItemStyle}
                      />
                      <Legend />
                      <Bar dataKey="PASSED" stackId="b" name="Aprobadas" fill={STATUS_COLOR.PASSED} />
                      <Bar dataKey="FAILED" stackId="b" name="Reprobadas" fill={STATUS_COLOR.FAILED} />
                      <Bar dataKey="ABSENT" stackId="b" name="Ausentes" fill={STATUS_COLOR.ABSENT} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </Paper>
            </Box>
          )}
        </>
      )}

      {/* -------- Bucket drill-down dialog -------- */}
      <Dialog
        open={bucketDialogOpen}
        onClose={() => setBucketDialogOpen(false)}
        fullWidth
        maxWidth="md"
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" component="span" sx={{ fontWeight: 700 }}>
            {bucketDialogTitle}
          </Typography>
          <IconButton onClick={() => setBucketDialogOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          {bucketDialogLoading ? (
            <Box sx={{ p: 3, display: 'grid', placeItems: 'center' }}>
              <CircularProgress size={22} />
            </Box>
          ) : bucketRows.length === 0 ? (
            <Box sx={{ p: 3 }}>
              <Alert severity="info">No hay coincidencias para este bucket.</Alert>
            </Box>
          ) : (
            <Box sx={{ p: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Alumno</TableCell>
                    <TableCell>Curso</TableCell>
                    <TableCell align="right">Reprobados</TableCell>
                    <TableCell align="right">Ausentes</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {bucketRows.map((r, i) => {
                    const name = [r.firstname, r.lastname].filter(Boolean).join(' ') || r.email || `ID ${r.user_id}`;
                    return (
                      <TableRow key={`${r.user_id}-${r.course_id}-${i}`}>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>{name}</TableCell>
                        <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}> {r.course_name || '—'} {/* << show course name */} </TableCell>
                        <TableCell align="right">{r.failed_count}</TableCell>
                        <TableCell align="right">{r.absent_count}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Page>
  );
}