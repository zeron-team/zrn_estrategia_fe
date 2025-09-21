// src/pages/PredictiveDashboardPage.js
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  IconButton,
  Button,
  Divider,
  Chip,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import CloseIcon from '@mui/icons-material/Close';
import { useTheme, alpha } from '@mui/material/styles';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';

import Page from '../components/layout/Page';
import {
  // uses the endpoint /api/predictive/overview/risk_by_course
  getRiskByCourse,
  getRiskTimeSeries,
  getRiskHeatmap,
  getAtRiskStudents,
} from '../services/predictiveApi';

// ---- Helpers ----
const fmtPct = (n) => `${(Number(n || 0) * 100).toFixed(1)}%`;
const fmtInt = (n) => (n == null ? 0 : Number(n));

export default function PredictiveDashboardPage() {
  const theme = useTheme();

  // Tunables (you can wire these to controls later)
  const MIN_SCORE = 50;
  const TS_MONTHS = 12;
  const HM_MONTHS = 6;
  const TOP_COURSES = 18;

  // Colors
  const COLORS = useMemo(
    () => ({
      primary: theme.palette.primary.main,
      risk: theme.palette.error.main,
      warn: theme.palette.warning.main,
      ok: theme.palette.success.main,
      info: theme.palette.info.main,
      axis: theme.palette.grey[700],
      label: theme.palette.grey[800], // dark grey for tooltip labels
    }),
    [theme]
  );

  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [overview, setOverview] = useState([]); // [{ course_id, course_name, at_risk_count, total_learners, risk_rate }]
  const [series, setSeries] = useState([]);     // [{ period, at_risk_count, is_forecast }]
  const [heat, setHeat] = useState([]);         // [{ course_id, course_name, period, at_risk_count }]

  // Drilldown
  const [selCourse, setSelCourse] = useState(null); // { course_id, course_name }
  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentsError, setStudentsError] = useState(null);

  // Tooltip styles
  const tooltipContentStyle = {
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: 8,
    boxShadow:
      theme.palette.mode === 'light' ? '0 6px 24px rgba(0,0,0,0.06)' : '0 10px 30px rgba(0,0,0,0.35)',
  };
  const tooltipLabelStyle = {
    color: COLORS.label,
    fontWeight: 700,
    textTransform: 'none',
  };
  const tooltipItemStyle = {
    color: theme.palette.text.secondary,
  };

  // Fetch all blocks — tolerant to timeouts/errors and with robust fallback
  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [ovRes, tsRes, hmRes] = await Promise.allSettled([
        // NOTE: this call can be slow — may timeout client-side
        getRiskByCourse({ min_score: MIN_SCORE, limit: 12 }),
        getRiskTimeSeries({
          minScore: MIN_SCORE,
          monthsBack: TS_MONTHS,
          includeForecast: true,
          forecastHorizon: 3,
        }),
        getRiskHeatmap({
          minScore: MIN_SCORE,
          monthsBack: HM_MONTHS,
          topCourses: TOP_COURSES,
        }),
      ]);

      // Heatmap is used as a fallback basis if the top-courses endpoint times out
      const hm = hmRes.status === 'fulfilled' ? (Array.isArray(hmRes.value) ? hmRes.value : []) : [];
      setHeat(hm);

      // Series
      const ts = tsRes.status === 'fulfilled' ? (Array.isArray(tsRes.value) ? tsRes.value : []) : [];
      setSeries(ts);

      // Overview (top courses)
      let ov = ovRes.status === 'fulfilled' ? (Array.isArray(ovRes.value) ? ovRes.value : []) : [];

      // Fallback: if the dedicated endpoint failed or returned empty, aggregate from heatmap
      if ((!ov || ov.length === 0) && hm.length > 0) {
        const byCourse = new Map();
        hm.forEach((r) => {
          const key = `${r.course_id}::${r.course_name}`;
          byCourse.set(key, (byCourse.get(key) || 0) + Number(r.at_risk_count || 0));
        });
        ov = Array.from(byCourse.entries())
          .map(([k, v]) => {
            const [course_id, course_name] = k.split('::');
            return {
              course_id: Number(course_id),
              course_name,
              at_risk_count: v,
              total_learners: 0,
              risk_rate: 0,
            };
          })
          .sort((a, b) => b.at_risk_count - a.at_risk_count)
          .slice(0, 12);
      }
      setOverview(ov);

      // Only show a global error if EVERYTHING failed
      if (ovRes.status === 'rejected' && tsRes.status === 'rejected' && hmRes.status === 'rejected') {
        setError('No se pudieron cargar los datos predictivos.');
      }
    } catch (e) {
      console.error(e);
      setError('No se pudieron cargar los datos predictivos.');
    } finally {
      setLoading(false);
    }
  }, [MIN_SCORE, TS_MONTHS, HM_MONTHS, TOP_COURSES]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Drilldown fetch
  const loadStudents = useCallback(async (course) => {
    if (!course) return;
    setStudents([]);
    setStudentsError(null);
    setStudentsLoading(true);
    try {
      const rows = await getAtRiskStudents({ minScore: MIN_SCORE, courseId: course.course_id, limit: 300 });
      setStudents(Array.isArray(rows) ? rows : []);
    } catch (err) {
      console.error(err);
      setStudentsError('No se pudieron cargar los estudiantes en riesgo para este curso.');
    } finally {
      setStudentsLoading(false);
    }
  }, [MIN_SCORE]);

  const onBarClick = (data) => {
    const p = data?.activePayload?.[0]?.payload;
    if (!p) return;
    const course = { course_id: p.course_id, course_name: p.course_name };
    setSelCourse(course);
    loadStudents(course);
  };

  // Layout
  return (
    <Page
      title="Dashboard Predictivo"
      actions={
        <Button startIcon={<RefreshIcon />} onClick={fetchAll} disabled={loading} sx={{ fontWeight: 600 }}>
          Recargar
        </Button>
      }
    >
      {loading ? (
        <Box sx={{ display: 'grid', placeItems: 'center', height: 260 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <>
          {/* ===== Row 1: Top cursos en riesgo + Time series ===== */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: { xs: 2, md: 3 },
              alignItems: 'stretch',
              mb: { xs: 2, md: 3 },
            }}
          >
            {/* Top cursos en riesgo */}
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
                minWidth: 0,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Top cursos en riesgo
                </Typography>
                <Chip
                  size="small"
                  label={`min_score = ${MIN_SCORE}`}
                  sx={{
                    ml: 'auto',
                    bgcolor: alpha(theme.palette.error.main, 0.08),
                    color: theme.palette.error.main,
                    fontWeight: 600,
                  }}
                />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Cursos con mayor cantidad de alumnos en riesgo (combinación de reprobaciones y ausencias).
                Hacé clic en un curso para ver el detalle de alumnos.
              </Typography>

              <Box sx={{ flex: 1, minHeight: 0 }}>
                {!overview?.length ? (
                  <Box sx={{ display: 'grid', placeItems: 'center', height: '100%' }}>
                    <Alert severity="info" sx={{ maxWidth: 560, textAlign: 'center' }}>
                      No hay cursos en riesgo para los filtros actuales.
                    </Alert>
                  </Box>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={overview}
                      layout="vertical"
                      margin={{ top: 8, right: 24, left: 24, bottom: 8 }}
                      onClick={onBarClick}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" stroke={COLORS.axis} tick={{ fill: COLORS.axis }} allowDecimals={false} />
                      <YAxis
                        type="category"
                        dataKey="course_name"
                        width={280}
                        stroke={COLORS.axis}
                        tick={{ fill: COLORS.axis, fontSize: 12, fontWeight: 600 }}
                        tickFormatter={(v) => (v?.length > 32 ? `${v.slice(0, 32)}…` : v)}
                      />
                      <RTooltip
                        formatter={(value, key) => {
                          if (key === 'at_risk_count') return [fmtInt(value), 'Alumnos en riesgo'];
                          if (key === 'total_learners') return [fmtInt(value), 'Alumnos únicos'];
                          if (key === 'risk_rate') return [fmtPct(value), 'Tasa de riesgo'];
                          return [value, key];
                        }}
                        labelFormatter={(label) => label}
                        contentStyle={tooltipContentStyle}
                        labelStyle={tooltipLabelStyle}
                        itemStyle={tooltipItemStyle}
                      />
                      <Legend />
                      <Bar
                        dataKey="at_risk_count"
                        name="Alumnos en riesgo"
                        fill={COLORS.risk}
                        cursor="pointer"
                        isAnimationActive={false}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </Box>
            </Paper>

            {/* Serie temporal */}
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
                minWidth: 0,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                Alumnos en riesgo por mes
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                La línea punteada corresponde a proyección simple de los próximos meses.
              </Typography>

              <Box sx={{ flex: 1, minHeight: 0 }}>
                {!series?.length ? (
                  <Box sx={{ display: 'grid', placeItems: 'center', height: '100%' }}>
                    <Alert severity="info" sx={{ maxWidth: 520, textAlign: 'center' }}>
                      No hay datos de la serie temporal.
                    </Alert>
                  </Box>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={series} margin={{ top: 8, right: 24, left: 8, bottom: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" stroke={COLORS.axis} tick={{ fill: COLORS.axis }} />
                      <YAxis stroke={COLORS.axis} tick={{ fill: COLORS.axis }} allowDecimals={false} />
                      <RTooltip contentStyle={tooltipContentStyle} labelStyle={tooltipLabelStyle} itemStyle={tooltipItemStyle} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="at_risk_count"
                        name="En riesgo"
                        stroke={COLORS.primary}
                        strokeWidth={2}
                        dot={false}
                        isAnimationActive={false}
                      />
                      <Line
                        type="monotone"
                        dataKey={(d) => (d.is_forecast ? d.at_risk_count : null)}
                        name="Proyección"
                        stroke={COLORS.info}
                        strokeDasharray="5 5"
                        strokeWidth={2}
                        dot={false}
                        isAnimationActive={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </Box>
            </Paper>
          </Box>

          {/* ===== Row 2: Heatmap (simple matrix) ===== */}
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
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              Heatmap de cursos en riesgo (últimos meses)
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Intensidad según cantidad de alumnos en riesgo por curso y mes.
            </Typography>

            {!heat?.length ? (
              <Alert severity="info">No hay datos para el heatmap.</Alert>
            ) : (
              <SimpleHeatmap rows={heat} />
            )}
          </Paper>

          {/* ===== Drill-down table ===== */}
          {selCourse && (
            <Paper
              elevation={0}
              sx={{
                mt: { xs: 2, md: 3 },
                p: 2,
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                boxShadow:
                  theme.palette.mode === 'light'
                    ? '0 6px 24px rgba(0,0,0,0.06)'
                    : '0 10px 30px rgba(0,0,0,0.35)',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Alumnos en riesgo — {selCourse.course_name}
                </Typography>
                <Chip
                  size="small"
                  label={`Curso ID: ${selCourse.course_id}`}
                  sx={{
                    bgcolor: alpha(theme.palette.info.main, 0.08),
                    color: theme.palette.info.main,
                    fontWeight: 600,
                  }}
                />
                <IconButton
                  aria-label="Cerrar"
                  sx={{ ml: 'auto' }}
                  onClick={() => {
                    setSelCourse(null);
                    setStudents([]);
                    setStudentsError(null);
                  }}
                >
                  <CloseIcon />
                </IconButton>
              </Box>
              <Divider sx={{ mb: 2 }} />

              {studentsLoading ? (
                <Box sx={{ display: 'grid', placeItems: 'center', height: 160 }}>
                  <CircularProgress />
                </Box>
              ) : studentsError ? (
                <Alert severity="error">{studentsError}</Alert>
              ) : !students?.length ? (
                <Alert severity="info">No se encontraron alumnos en riesgo para este curso.</Alert>
              ) : (
                <Box sx={{ overflowX: 'auto' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Alumno</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell align="right">Reprobados</TableCell>
                        <TableCell align="right">Ausentes</TableCell>
                        <TableCell align="center">Último período</TableCell>
                        <TableCell align="right">Puntaje riesgo</TableCell>
                        <TableCell>Bucket</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {students.map((s) => (
                        <TableRow key={`${s.user_id}-${s.course_id}`}>
                          <TableCell>{s.lastname} {s.firstname}</TableCell>
                          <TableCell>{s.email}</TableCell>
                          <TableCell align="right">{fmtInt(s.failed_count)}</TableCell>
                          <TableCell align="right">{fmtInt(s.absent_count)}</TableCell>
                          <TableCell align="center">{s.last_period || '-'}</TableCell>
                          <TableCell align="right">{fmtInt(s.risk_score)}</TableCell>
                          <TableCell>{s.bucket}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              )}
            </Paper>
          )}
        </>
      )}
    </Page>
  );
}

/**
 * Minimal heatmap (CSS grid) — readable & lightweight
 * Expects rows: [{ course_id, course_name, period, at_risk_count }]
 */
function SimpleHeatmap({ rows }) {
  const theme = useTheme();

  const courseNames = useMemo(
    () => Array.from(new Map(rows.map((r) => [r.course_id, r.course_name])).values()),
    [rows]
  );
  const periods = useMemo(
    () => Array.from(new Set(rows.map((r) => r.period))).sort((a, b) => (a < b ? -1 : a > b ? 1 : 0)),
    [rows]
  );

  const valueMap = useMemo(() => {
    const m = new Map();
    for (const r of rows) m.set(`${r.course_name}__${r.period}`, Number(r.at_risk_count || 0));
    return m;
  }, [rows]);

  const maxVal = useMemo(() => {
    let m = 0;
    for (const v of valueMap.values()) m = Math.max(m, v);
    return m || 1;
  }, [valueMap]);

  const colorFor = (v) => {
    const alphaVal = Math.min(0.08 + (v / maxVal) * 0.6, 0.68);
    return {
      bg: alpha(theme.palette.error.main, alphaVal),
      fg: theme.palette.getContrastText(theme.palette.background.paper),
    };
  };

  return (
    <Box sx={{ overflowX: 'auto' }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: `240px repeat(${periods.length}, 1fr)`,
          alignItems: 'stretch',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
        }}
      >
        <Box sx={{ p: 1.5, fontWeight: 700, bgcolor: 'background.default', borderRight: '1px solid', borderColor: 'divider' }}>
          Curso \ Mes
        </Box>
        {periods.map((p) => (
          <Box key={`h-${p}`} sx={{ p: 1.5, fontWeight: 700, textAlign: 'center', borderRight: '1px solid', borderColor: 'divider' }}>
            {p}
          </Box>
        ))}

        {courseNames.map((cName, rIdx) => (
          <React.Fragment key={`row-${rIdx}`}>
            <Box
              sx={{
                p: 1.25,
                fontWeight: 600,
                borderTop: '1px solid',
                borderRight: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.default',
                color: theme.palette.grey[800],
              }}
            >
              {cName}
            </Box>
            {periods.map((p, cIdx) => {
              const val = valueMap.get(`${cName}__${p}`) || 0;
              const { bg } = colorFor(val);
              return (
                <Box
                  key={`cell-${rIdx}-${cIdx}`}
                  title={`${cName} • ${p}: ${val}`}
                  sx={{
                    p: 1.25,
                    textAlign: 'center',
                    borderTop: '1px solid',
                    borderRight: cIdx < periods.length - 1 ? '1px solid' : 'none',
                    borderColor: 'divider',
                    bgcolor: bg,
                    fontVariantNumeric: 'tabular-nums',
                    userSelect: 'none',
                  }}
                >
                  {val}
                </Box>
              );
            })}
          </React.Fragment>
        ))}
      </Box>
    </Box>
  );
}