import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box, Paper, Typography, Alert, CircularProgress, Chip,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import { getRiskByCourseOverview } from '../../services/predictiveApi';

const fmtInt = (n) => (n == null ? 0 : Number(n));
const fmtPct = (n) => `${(Number(n || 0) * 100).toFixed(1)}%`;

export default function TopRiskCourses({
  minScore = 50,
  limit = 12,
  onSelectCourse,        // (course) => void
  height = 420,
  title = 'Top cursos en riesgo',
  subtitle = 'Cantidad de alumnos en riesgo por curso (click para ver el detalle).',
}) {
  const theme = useTheme();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  const colors = useMemo(() => ({
    axis: theme.palette.grey[700],
    label: theme.palette.grey[800],
    bar: theme.palette.error.main,
  }), [theme]);

  const tooltipContentStyle = {
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: 8,
    boxShadow: theme.palette.mode === 'light'
      ? '0 6px 24px rgba(0,0,0,0.06)'
      : '0 10px 30px rgba(0,0,0,0.35)',
  };
  const tooltipLabelStyle = { color: colors.label, fontWeight: 700 };
  const tooltipItemStyle = { color: theme.palette.text.secondary };

  const fetchData = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const data = await getRiskByCourseOverview({ minScore, limit });
      // Expect: [{ course_id, course_name, at_risk_count, total_learners, risk_rate }]
      setRows(Array.isArray(data) ? data : []);
      // Debug line (keep while validating):
      // console.debug('TopRiskCourses → overview payload:', data);
    } catch (e) {
      console.error(e);
      setErr('No se pudieron cargar los cursos en riesgo.');
    } finally {
      setLoading(false);
    }
  }, [minScore, limit]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleClick = (evt) => {
    const p = evt?.activePayload?.[0]?.payload;
    if (!p || !onSelectCourse) return;
    onSelectCourse({ course_id: p.course_id, course_name: p.course_name });
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: theme.palette.mode === 'light'
          ? '0 6px 24px rgba(0,0,0,0.06)'
          : '0 10px 30px rgba(0,0,0,0.35)',
        height,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
        <Chip
          size="small"
          label={`min_score = ${minScore}`}
          sx={{
            ml: 'auto',
            bgcolor: alpha(theme.palette.error.main, 0.08),
            color: theme.palette.error.main,
            fontWeight: 600,
          }}
        />
      </Box>
      {subtitle && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {subtitle}
        </Typography>
      )}

      <Box sx={{ flex: 1, minHeight: 0 }}>
        {loading ? (
          <Box sx={{ display: 'grid', placeItems: 'center', height: '100%' }}>
            <CircularProgress />
          </Box>
        ) : err ? (
          <Alert severity="error">{err}</Alert>
        ) : !rows.length ? (
          <Alert severity="info">No hay cursos en riesgo para los filtros actuales.</Alert>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={rows}
              layout="vertical"
              margin={{ top: 8, right: 24, left: 24, bottom: 8 }}
              onClick={handleClick}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                type="number"
                stroke={colors.axis}
                tick={{ fill: colors.axis }}
                allowDecimals={false}
              />
              <YAxis
                type="category"
                dataKey="course_name"                 // ✅ correct key
                width={280}
                stroke={colors.axis}
                tick={{ fill: colors.axis, fontSize: 12, fontWeight: 600 }}
                tickFormatter={(v) => (v?.length > 32 ? `${v.slice(0, 32)}…` : v)}
              />
              <Tooltip
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
                dataKey="at_risk_count"              // ✅ correct key
                name="Alumnos en riesgo"
                fill={colors.bar}
                cursor="pointer"
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Box>
    </Paper>
  );
}