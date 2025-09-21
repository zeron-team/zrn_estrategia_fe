// src/pages/ExamDebtDashboardPage.js
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Button,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  FormControlLabel,
  Switch,
  Chip,
  IconButton,
  Tooltip,
  Divider,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import DownloadIcon from '@mui/icons-material/Download';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import LooksOneIcon from '@mui/icons-material/LooksOne';
import LooksTwoIcon from '@mui/icons-material/LooksTwo';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import PieChartOutlineIcon from '@mui/icons-material/PieChartOutline';

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RTooltip,
} from 'recharts';

import Page from '../components/layout/Page';
import { getExamDebtSummaryByCourse } from '../services/examDebtApi';

// --------------------------
// Helpers
// --------------------------
const fmtInt = (n) => (n == null ? 0 : Number(n));
const sumCols = (arr, keys) =>
  keys.reduce((acc, k) => acc + arr.reduce((s, r) => s + fmtInt(r[k]), 0), 0);

const csvEscape = (v) => {
  const s = `${v ?? ''}`;
  return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

// --------------------------
// Main component
// --------------------------
export default function ExamDebtDashboardPage() {
  const theme = useTheme();

  const COLORS = useMemo(
    () => ({
      ok: theme.palette.success.main,
      info: theme.palette.info.main,
      warn: theme.palette.warning.main,
      risk: theme.palette.error.main,
      axis: theme.palette.grey[700],
      card: theme.palette.mode === 'light'
        ? '0 6px 24px rgba(0,0,0,0.06)'
        : '0 10px 30px rgba(0,0,0,0.35)',
    }),
    [theme]
  );

  // --------------------------
  // State
  // --------------------------
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  /** Backend dataset:
   *  rows: [{ career_id?, career_name, course_id, course_name, debt_0, debt_1, debt_2, debt_gt_2 }]
   */
  const [rows, setRows] = useState([]);

  // Filters
  const [q, setQ] = useState('');                 // search by course name
  const [career, setCareer] = useState('all');    // career filter
  const [onlyDebt, setOnlyDebt] = useState(false);// hide rows with 0 debt total
  const [minBucket, setMinBucket] = useState('all'); // all | 1 | 2 | 3 (>=3)

  // Table expand/collapse
  const [expanded, setExpanded] = useState(() => new Set());

  // --------------------------
  // Fetch
  // --------------------------
  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getExamDebtSummaryByCourse();
      setRows(Array.isArray(data) ? data : []);
      // expand primeras 3 carreras (look & feel)
      const firstCareers = new Set(
        Array.from(
          new Map(
            (Array.isArray(data) ? data : []).map((r) => [
              `${r.career_id || 0}::${r.career_name || 'Sin categoría'}`,
              true,
            ])
          ).keys()
        ).slice(0, 3)
      );
      setExpanded(firstCareers);
    } catch (e) {
      console.error(e);
      setError('No se pudo cargar la información de exámenes adeudados.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // --------------------------
  // Derived: careers list
  // --------------------------
  const careerOptions = useMemo(() => {
    const map = new Map();
    for (const r of rows) {
      const id = r.career_id ?? 0;
      const name = r.career_name || 'Sin categoría';
      map.set(id, name);
    }
    return [{ id: 'all', name: 'Todas las carreras' }].concat(
      Array.from(map.entries())
        .map(([id, name]) => ({ id, name }))
        .sort((a, b) => a.name.localeCompare(b.name))
    );
  }, [rows]);

  // --------------------------
  // Apply filters (client-side)
  // --------------------------
  const filtered = useMemo(() => {
    let data = rows;

    if (career !== 'all') {
      const cid = Number(career);
      data = data.filter((r) => (r.career_id ?? 0) === cid);
    }

    if (q.trim()) {
      const s = q.trim().toLowerCase();
      data = data.filter((r) => (r.course_name || '').toLowerCase().includes(s));
    }

    if (minBucket !== 'all') {
      const min = Number(minBucket);
      // min=1 => requiere que (debt_1 + debt_2 + debt_gt_2) >= 1
      // min=2 => requiere que (debt_2 + debt_gt_2) >= 1
      // min=3 => requiere que (debt_gt_2) >= 1
      data = data.filter((r) => {
        const b1 = fmtInt(r.debt_1);
        const b2 = fmtInt(r.debt_2);
        const b3 = fmtInt(r.debt_gt_2);
        if (min === 1) return b1 + b2 + b3 > 0;
        if (min === 2) return b2 + b3 > 0;
        return b3 > 0; // min === 3
      });
    }

    if (onlyDebt) {
      data = data.filter((r) => (fmtInt(r.debt_1) + fmtInt(r.debt_2) + fmtInt(r.debt_gt_2)) > 0);
    }

    return data;
  }, [rows, career, q, minBucket, onlyDebt]);

  // --------------------------
  // Grouped by career (and group totals)
  // --------------------------
  const grouped = useMemo(() => {
    const map = new Map();
    for (const r of filtered) {
      const key = `${r.career_id || 0}::${r.career_name || 'Sin categoría'}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(r);
    }

    const groups = Array.from(map.entries()).map(([key, courses]) => {
      courses.sort((a, b) => (a.course_name || '').localeCompare(b.course_name || ''));
      const totals = {
        debt_0: sumCols(courses, ['debt_0']),
        debt_1: sumCols(courses, ['debt_1']),
        debt_2: sumCols(courses, ['debt_2']),
        debt_gt_2: sumCols(courses, ['debt_gt_2']),
      };
      const [career_id_str, career_name] = key.split('::');
      return {
        key,
        career_id: Number(career_id_str),
        career_name,
        courses,
        totals,
      };
    });

    return groups.sort((a, b) => a.career_name.localeCompare(b.career_name));
  }, [filtered]);

  // --------------------------
  // Grand totals (drive KPIs & pie)
  // --------------------------
  const grand = useMemo(() => {
    const allCourses = grouped.flatMap((g) => g.courses);
    return {
      debt_0: sumCols(allCourses, ['debt_0']),
      debt_1: sumCols(allCourses, ['debt_1']),
      debt_2: sumCols(allCourses, ['debt_2']),
      debt_gt_2: sumCols(allCourses, ['debt_gt_2']),
    };
  }, [grouped]);

  const totalPeople = grand.debt_0 + grand.debt_1 + grand.debt_2 + grand.debt_gt_2;

  const pieData = useMemo(() => {
    // Se alimenta SOLO con grand, para que todo coincida
    return [
      { key: 'debt_0', name: 'Al día (0)', value: grand.debt_0, color: COLORS.ok, icon: <CheckCircleOutlineIcon /> },
      { key: 'debt_1', name: 'Debe 1',     value: grand.debt_1, color: COLORS.info, icon: <LooksOneIcon /> },
      { key: 'debt_2', name: 'Debe 2',     value: grand.debt_2, color: COLORS.warn, icon: <LooksTwoIcon /> },
      { key: 'debt_gt_2', name: 'Debe +2', value: grand.debt_gt_2, color: COLORS.risk, icon: <WarningAmberIcon /> },
    ];
  }, [grand, COLORS]);

  // --------------------------
  // Expand / Collapse handlers
  // --------------------------
  const toggleGroup = (groupKey) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(groupKey)) next.delete(groupKey);
      else next.add(groupKey);
      return next;
    });
  };
  const expandAll = () => setExpanded(new Set(grouped.map((g) => g.key)));
  const collapseAll = () => setExpanded(new Set());

  // --------------------------
  // Export CSV (filtered, grouped)
  // --------------------------
  const exportCsv = () => {
    const header = ['Carrera', 'Curso', 'Al día (0)', 'Debe 1', 'Debe 2', 'Debe +2'];
    const lines = [header.join(';')];
    for (const g of grouped) {
      for (const c of g.courses) {
        lines.push([
          csvEscape(g.career_name),
          csvEscape(c.course_name),
          fmtInt(c.debt_0),
          fmtInt(c.debt_1),
          fmtInt(c.debt_2),
          fmtInt(c.debt_gt_2),
        ].join(';'));
      }
      // Línea de totales del grupo
      lines.push([
        csvEscape(`${g.career_name} — TOTAL`),
        '',
        fmtInt(g.totals.debt_0),
        fmtInt(g.totals.debt_1),
        fmtInt(g.totals.debt_2),
        fmtInt(g.totals.debt_gt_2),
      ].join(';'));
      lines.push(''); // separador
    }
    // Totales generales
    lines.push([
      'TOTAL GENERAL', '',
      fmtInt(grand.debt_0),
      fmtInt(grand.debt_1),
      fmtInt(grand.debt_2),
      fmtInt(grand.debt_gt_2),
    ].join(';'));

    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'examenes_adeudados.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  // --------------------------
  // Render
  // --------------------------
  return (
    <Page
      title="Exámenes Adeudados (racha de ausencias)"
      actions={
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Exportar CSV (filtros aplicados)">
            <span>
              <Button
                onClick={exportCsv}
                startIcon={<DownloadIcon />}
                sx={{ fontWeight: 700 }}
                disabled={loading || !filtered.length}
              >
                Exportar
              </Button>
            </span>
          </Tooltip>
          <Tooltip title="Recargar datos">
            <span>
              <Button
                onClick={fetchAll}
                startIcon={<RestartAltIcon />}
                sx={{ fontWeight: 700 }}
                disabled={loading}
              >
                Recargar
              </Button>
            </span>
          </Tooltip>
        </Box>
      }
    >
      {/* Filter bar */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 2,
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: COLORS.card,
          bgcolor: (t) => alpha(t.palette.background.paper, 0.9),
        }}
      >
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2.2fr 1.6fr 1fr auto auto' }, gap: 1.5, alignItems: 'center' }}>
          <TextField
            size="small"
            label="Buscar curso"
            placeholder="Ej: Matemática I"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />

          <FormControl size="small">
            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, ml: 0.5 }}>Carrera</Typography>
            <Select
              value={career}
              onChange={(e) => setCareer(e.target.value)}
              startAdornment={<InputAdornment position="start"><FilterAltIcon sx={{ mr: 0.5 }} /></InputAdornment>}
            >
              {careerOptions.map((c) => (
                <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small">
            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, ml: 0.5 }}>Bucket mínimo</Typography>
            <Select value={minBucket} onChange={(e) => setMinBucket(e.target.value)}>
              <MenuItem value="all">Todos</MenuItem>
              <MenuItem value="1">Debe ≥ 1</MenuItem>
              <MenuItem value="2">Debe ≥ 2</MenuItem>
              <MenuItem value="3">Debe ≥ 3</MenuItem>
            </Select>
          </FormControl>

          <FormControlLabel
            control={
              <Switch
                checked={onlyDebt}
                onChange={(e) => setOnlyDebt(e.target.checked)}
              />
            }
            label="Solo con deuda"
          />

          <Box sx={{ display: 'flex', gap: 1, justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
            <Tooltip title="Expandir todo">
              <span>
                <IconButton onClick={expandAll} disabled={!grouped.length}>
                  <ExpandMoreIcon />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Plegar todo">
              <span>
                <IconButton onClick={collapseAll} disabled={!grouped.length}>
                  <ExpandLessIcon />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Limpiar filtros">
              <span>
                <IconButton
                  onClick={() => { setQ(''); setCareer('all'); setOnlyDebt(false); setMinBucket('all'); }}
                  disabled={loading && !rows.length}
                >
                  <RestartAltIcon />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        </Box>
      </Paper>

      {loading ? (
        <Box sx={{ display: 'grid', placeItems: 'center', height: 260 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : !rows.length ? (
        <Alert severity="info">Sin datos disponibles.</Alert>
      ) : (
        <>
          {/* KPIs */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
              gap: 2,
              mb: 2,
            }}
          >
            <Kpi
              title="Al día (0)"
              value={grand.debt_0}
              color={COLORS.ok}
              icon={<CheckCircleOutlineIcon />}
            />
            <Kpi
              title="Debe 1"
              value={grand.debt_1}
              color={COLORS.info}
              icon={<LooksOneIcon />}
            />
            <Kpi
              title="Debe 2"
              value={grand.debt_2}
              color={COLORS.warn}
              icon={<LooksTwoIcon />}
            />
            <Kpi
              title="Debe +2"
              value={grand.debt_gt_2}
              color={COLORS.risk}
              icon={<WarningAmberIcon />}
            />
          </Box>

          {/* Pie + legend (side-by-side) */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 2,
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: COLORS.card,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'stretch', gap: 3, flexWrap: 'wrap' }}>
              <Box sx={{ minWidth: 280, flex: '1 1 360px', height: 320 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PieChartOutlineIcon /> Distribución total
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                  Racha de <strong>ausencias consecutivas</strong> desde la última evaluación (hasta hoy).
                </Typography>
                <ResponsiveContainer width="100%" height="85%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      outerRadius="85%"
                      isAnimationActive={false}
                      stroke="#fff"
                      strokeWidth={1}
                    >
                      {pieData.map((it) => (
                        <Cell key={it.key} fill={it.color} />
                      ))}
                    </Pie>
                    <RTooltip
                      formatter={(v, n) => [`${fmtInt(v)}`, n]}
                      contentStyle={{
                        backgroundColor: theme.palette.background.paper,
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: 8,
                        boxShadow: COLORS.card,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Box>

              <Box sx={{ minWidth: 260, flex: '0 0 280px', display: 'flex', flexDirection: 'column', gap: 1.25, justifyContent: 'center' }}>
                {pieData.map((it) => {
                  const pct = totalPeople ? ((it.value / totalPeople) * 100).toFixed(1) : '0.0';
                  return (
                    <Box
                      key={it.key}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        p: 1,
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        bgcolor: alpha(it.color, 0.06),
                      }}
                    >
                      <Box
                        sx={{
                          width: 14, height: 14, borderRadius: '50%',
                          bgcolor: it.color, flexShrink: 0,
                        }}
                      />
                      <Typography variant="body2" sx={{ flex: 1, fontWeight: 700 }}>
                        {it.name}
                      </Typography>
                      <Chip
                        label={`${fmtInt(it.value)} • ${pct}%`}
                        size="small"
                        sx={{
                          bgcolor: alpha(it.color, 0.12),
                          color: it.color,
                          fontWeight: 700,
                        }}
                      />
                    </Box>
                  );
                })}
              </Box>
            </Box>
          </Paper>

          {/* Grouped table: Career -> Courses */}
          <Paper
            elevation={0}
            sx={{
              p: 0,
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: COLORS.card,
              overflow: 'hidden',
            }}
          >
            <Box sx={{ p: 2, pb: 1.5 }}>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Detalle por Carrera y Curso
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Click en <strong>(+)/(−)</strong> para desplegar/plegar cursos dentro de cada carrera.
              </Typography>
            </Box>
            <Divider />

            {!grouped.length ? (
              <Box sx={{ p: 2 }}><Alert severity="info">No hay datos para mostrar con los filtros actuales.</Alert></Box>
            ) : (
              <Box sx={{ width: '100%', overflowX: 'auto' }}>
                <Box component="table" sx={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                  <Box component="thead" sx={{ bgcolor: 'background.default' }}>
                    <Box component="tr">
                      <Box component="th" sx={thSx}>Carrera / Curso</Box>
                      <Box component="th" sx={thSx} align="right">Al día (0)</Box>
                      <Box component="th" sx={thSx} align="right">Debe 1</Box>
                      <Box component="th" sx={thSx} align="right">Debe 2</Box>
                      <Box component="th" sx={thSx} align="right">Debe +2</Box>
                    </Box>
                  </Box>

                  <Box component="tbody">
                    {grouped.map((g) => {
                      const isOpen = expanded.has(g.key);
                      const careerChipColor = (g.totals.debt_1 + g.totals.debt_2 + g.totals.debt_gt_2) > 0
                        ? theme.palette.warning.main
                        : theme.palette.success.main;

                      return (
                        <React.Fragment key={g.key}>
                          {/* Group row */}
                          <Box component="tr" sx={{
                            background: (t) => alpha(t.palette.primary.main, t.palette.mode === 'light' ? 0.06 : 0.12),
                          }}>
                            <Box component="td" sx={tdGroupSx}>
                              <IconButton
                                onClick={() => toggleGroup(g.key)}
                                size="small"
                                sx={{ mr: 1 }}
                                aria-label={isOpen ? 'Plegar' : 'Desplegar'}
                              >
                                {isOpen ? <RemoveCircleOutlineIcon /> : <AddCircleOutlineIcon />}
                              </IconButton>
                              <Typography variant="subtitle1" sx={{ fontWeight: 800, mr: 1 }}>
                                {g.career_name}
                              </Typography>
                              <Chip
                                size="small"
                                label={`${g.courses.length} curso${g.courses.length === 1 ? '' : 's'}`}
                                sx={{ ml: 1, bgcolor: alpha(theme.palette.info.main, 0.12), color: theme.palette.info.main, fontWeight: 700 }}
                              />
                            </Box>
                            <Box component="td" sx={tdGroupNumSx} align="right">
                              <StrongNum color={COLORS.ok}>{fmtInt(g.totals.debt_0)}</StrongNum>
                            </Box>
                            <Box component="td" sx={tdGroupNumSx} align="right">
                              <StrongNum color={COLORS.info}>{fmtInt(g.totals.debt_1)}</StrongNum>
                            </Box>
                            <Box component="td" sx={tdGroupNumSx} align="right">
                              <StrongNum color={COLORS.warn}>{fmtInt(g.totals.debt_2)}</StrongNum>
                            </Box>
                            <Box component="td" sx={tdGroupNumSx} align="right">
                              <StrongNum color={COLORS.risk}>{fmtInt(g.totals.debt_gt_2)}</StrongNum>
                            </Box>
                          </Box>

                          {/* Course rows */}
                          {isOpen && g.courses.map((c, idx) => (
                            <Box component="tr" key={`${g.key}-${c.course_id}`} sx={{ backgroundColor: idx % 2 ? 'background.default' : 'transparent' }}>
                              <Box component="td" sx={tdSx}>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>{c.course_name}</Typography>
                              </Box>
                              <Box component="td" sx={tdNumSx} align="right">
                                <Num color={COLORS.ok}>{fmtInt(c.debt_0)}</Num>
                              </Box>
                              <Box component="td" sx={tdNumSx} align="right">
                                <Num color={COLORS.info}>{fmtInt(c.debt_1)}</Num>
                              </Box>
                              <Box component="td" sx={tdNumSx} align="right">
                                <Num color={COLORS.warn}>{fmtInt(c.debt_2)}</Num>
                              </Box>
                              <Box component="td" sx={tdNumSx} align="right">
                                <Num color={COLORS.risk}>{fmtInt(c.debt_gt_2)}</Num>
                              </Box>
                            </Box>
                          ))}
                        </React.Fragment>
                      );
                    })}

                    {/* Grand total row */}
                    <Box component="tr" sx={{ backgroundColor: alpha(theme.palette.success.main, 0.06) }}>
                      <Box component="td" sx={{ ...tdGroupSx, fontWeight: 900 }}>
                        TOTAL GENERAL
                      </Box>
                      <Box component="td" sx={tdGroupNumSx} align="right"><StrongNum color={COLORS.ok}>{fmtInt(grand.debt_0)}</StrongNum></Box>
                      <Box component="td" sx={tdGroupNumSx} align="right"><StrongNum color={COLORS.info}>{fmtInt(grand.debt_1)}</StrongNum></Box>
                      <Box component="td" sx={tdGroupNumSx} align="right"><StrongNum color={COLORS.warn}>{fmtInt(grand.debt_2)}</StrongNum></Box>
                      <Box component="td" sx={tdGroupNumSx} align="right"><StrongNum color={COLORS.risk}>{fmtInt(grand.debt_gt_2)}</StrongNum></Box>
                    </Box>
                  </Box>
                </Box>
              </Box>
            )}
          </Paper>
        </>
      )}
    </Page>
  );
}

// --------------------------
// Subcomponents & styles
// --------------------------
function Kpi({ title, value, color, icon }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'center',
        gap: 1.25,
      }}
    >
      <Box
        sx={{
          width: 40, height: 40, borderRadius: '50%',
          display: 'grid', placeItems: 'center',
          bgcolor: (t) => alpha(color, t.palette.mode === 'light' ? 0.15 : 0.25),
          color,
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="caption" color="text.secondary" noWrap>{title}</Typography>
        <Typography variant="h5" sx={{ fontWeight: 900, lineHeight: 1.2 }}>
          {fmtInt(value)}
        </Typography>
      </Box>
    </Paper>
  );
}

function Num({ children, color }) {
  return <Typography component="span" sx={{ fontWeight: 700, color }}>{children}</Typography>;
}
function StrongNum({ children, color }) {
  return <Typography component="span" sx={{ fontWeight: 900, color }}>{children}</Typography>;
}

const thSx = {
  textAlign: 'left',
  p: 1.25,
  fontWeight: 800,
  borderBottom: '1px solid',
  borderColor: 'divider',
  whiteSpace: 'nowrap',
};
const tdSx = {
  p: 1.25,
  borderBottom: '1px solid',
  borderColor: 'divider',
  verticalAlign: 'middle',
};
const tdNumSx = {
  ...tdSx,
  textAlign: 'right',
  fontVariantNumeric: 'tabular-nums',
};
const tdGroupSx = {
  ...tdSx,
  fontWeight: 800,
};
const tdGroupNumSx = {
  ...tdNumSx,
  fontWeight: 900,
};