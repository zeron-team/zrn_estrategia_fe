// src/pages/CoursesPage.js
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  Box, Grid, Card, CardHeader, CardContent, List, ListItem, ListItemText,
  ListItemAvatar, Avatar, Divider, LinearProgress, Typography, IconButton,
  Chip, Paper, Skeleton, Alert
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import RefreshIcon from '@mui/icons-material/Refresh';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import InsightsIcon from '@mui/icons-material/Insights';
import SouthEastIcon from '@mui/icons-material/SouthEast';
import NorthEastIcon from '@mui/icons-material/NorthEast';
import Page from '../components/layout/Page';
import apiClient from '../api/client';

const pct = (n) => Math.max(0, Math.min(100, Number(n ?? 0)));
const mean = (a) => (a.length ? a.reduce((s, v) => s + v, 0) / a.length : 0);

function Header({ onRefresh, loading }) {
  const t = useTheme();
  return (
    <Paper elevation={0} sx={{
      mb: 3, p: { xs: 2, md: 2.5 }, borderRadius: 3, border: '1px solid', borderColor: 'divider',
      background: t.palette.mode === 'light'
        ? alpha(t.palette.background.paper, 0.9)
        : alpha(t.palette.background.default, 0.85)
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box sx={{
          width: 40, height: 40, borderRadius: '50%', display: 'grid', placeItems: 'center',
          bgcolor: alpha(t.palette.primary.main, t.palette.mode === 'light' ? 0.18 : 0.25),
          color: t.palette.primary.main, mr: 1
        }}>
          <InsightsIcon />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>Análisis de Cursos</Typography>
          <Typography variant="body2" color="text.secondary">Rankings por tasa de aprobación (Top 10 mejores y peores).</Typography>
        </Box>
        <IconButton onClick={onRefresh} disabled={loading} size="small"><RefreshIcon /></IconButton>
      </Box>
    </Paper>
  );
}

function KpiTile({ icon, title, value, subtitle, color = 'primary' }) {
  const t = useTheme(); const tone = t.palette[color] || t.palette.primary;
  return (
    <Paper elevation={0} sx={{
      p: 1.75, borderRadius: 2.5, border: '1px solid', borderColor: 'divider',
      display: 'grid', gridTemplateColumns: 'auto 1fr', gridTemplateRows: 'auto auto',
      columnGap: 1.25, rowGap: .25, alignItems: 'center',
      height: '100%', minHeight: 96
    }}>
      <Box sx={{
        width: 36, height: 36, borderRadius: '50%', display: 'grid', placeItems: 'center',
        bgcolor: alpha(tone.main, t.palette.mode === 'light' ? 0.16 : 0.24),
        color: tone.main, gridRow: '1 / span 2'
      }}>{icon}</Box>
      <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: .5 }}>{title}</Typography>
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, minWidth: 0 }}>
        <Typography variant="h5" sx={{ fontWeight: 900, lineHeight: 1 }}>{value}</Typography>
        {subtitle && <Typography variant="body2" color="text.secondary" noWrap title={subtitle} sx={{ fontWeight: 600 }}>{subtitle}</Typography>}
      </Box>
    </Paper>
  );
}

function CourseRankings({ title, data, accent, icon }) {
  const t = useTheme(); const tone = t.palette[accent] || t.palette.primary;
  return (
    <Card elevation={0} sx={{ height: '100%', borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
      <CardHeader
        avatar={<Avatar sx={{ bgcolor: alpha(tone.main, t.palette.mode === 'light' ? 0.18 : 0.28), color: tone.main }}>{icon}</Avatar>}
        title={<Typography variant="h6" sx={{ fontWeight: 800 }}>{title}</Typography>}
        sx={{ pb: 1.25 }}
      />
      <CardContent sx={{ pt: 0 }}>
        {!data?.length ? (
          <Alert severity="info" sx={{ borderRadius: 2, my: 1 }}>Sin datos</Alert>
        ) : (
          <List dense disablePadding>
            {data.map((c, i) => {
              const value = pct(c.approval_rate);
              return (
                <React.Fragment key={c.course_id ?? `${c.course_name}-${i}`}>
                  <ListItem sx={{ py: 1 }}>
                    <ListItemAvatar>
                      <Avatar variant="rounded" sx={{
                        width: 26, height: 26, fontSize: 13, fontWeight: 800,
                        bgcolor: alpha(tone.main, .14), color: tone.main
                      }}>{i + 1}</Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={<Typography variant="body2" sx={{ fontWeight: 700 }} noWrap title={c.course_name}>{c.course_name}</Typography>}
                      secondary={
                        <Box sx={{ mt: .75, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ flex: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={value}
                              sx={{ height: 8, borderRadius: 6, '& .MuiLinearProgress-bar': { borderRadius: 6 }, bgcolor: alpha(t.palette.grey[500], .18) }}
                              color={accent}
                            />
                          </Box>
                          <Chip size="small" label={`${value.toFixed(2)}%`} sx={{ fontWeight: 800, bgcolor: alpha(tone.main, .08), color: tone.main }} />
                        </Box>
                      }
                    />
                  </ListItem>
                  {i < data.length - 1 && <Divider component="li" />}
                </React.Fragment>
              );
            })}
          </List>
        )}
      </CardContent>
    </Card>
  );
}

export default function CoursesPage() {
  const [rankings, setRankings] = useState({ top_approved: [], top_disapproved: [] });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [ts, setTs] = useState(null);

  const fetchRankings = useCallback(async () => {
    setLoading(true); setErr(null);
    try {
      const res = await apiClient.get('/api/courses/rankings');
      const d = res.data || { top_approved: [], top_disapproved: [] };
      const topA = [...(d.top_approved || [])].sort((a, b) => pct(b.approval_rate) - pct(a.approval_rate));
      const topD = [...(d.top_disapproved || [])].sort((a, b) => pct(a.approval_rate) - pct(b.approval_rate));
      setRankings({ top_approved: topA, top_disapproved: topD });
      setTs(new Date());
    } catch (e) { setErr('No se pudieron obtener los rankings.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchRankings(); }, [fetchRankings]);

  const kpis = useMemo(() => {
    const best = rankings.top_approved?.[0];
    const worst = rankings.top_disapproved?.[0];
    const bestPct = pct(best?.approval_rate);
    const worstPct = pct(worst?.approval_rate);
    return {
      bestCourse: best?.course_name || '—',
      worstCourse: worst?.course_name || '—',
      bestPct,
      worstPct,
      avgBest: mean((rankings.top_approved || []).map((c) => pct(c.approval_rate))),
      avgWorst: mean((rankings.top_disapproved || []).map((c) => pct(c.approval_rate))),
    };
  }, [rankings]);

  return (
    <Page title="Análisis de Cursos" actions={<IconButton onClick={fetchRankings} disabled={loading} size="small"><RefreshIcon /></IconButton>}>
      <Header onRefresh={fetchRankings} loading={loading} />

      {/* KPIs — strictly 4 across on md+, equal height */}
      <Box sx={{ mb: 2.25 }}>
        {loading ? (
          <Grid container spacing={1.75} alignItems="stretch">
            {[...Array(4)].map((_, i) => (
              <Grid key={i} item xs={12} sm={6} md={3} sx={{ display: 'flex' }}>
                <Paper variant="outlined" sx={{ p: 1.75, borderRadius: 2.5, width: '100%' }}>
                  <Skeleton variant="circular" width={36} height={36} />
                  <Skeleton variant="text" width="60%" />
                  <Skeleton variant="text" width="40%" />
                </Paper>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Grid container spacing={1.75} alignItems="stretch">
            <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex' }}>
              <KpiTile title="Mejor Aprobación" value={`${kpis.bestPct.toFixed(1)}%`} subtitle={kpis.bestCourse} icon={<NorthEastIcon />} color="success" />
            </Grid>
            <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex' }}>
              <KpiTile title="Menor Aprobación" value={`${kpis.worstPct.toFixed(1)}%`} subtitle={kpis.worstCourse} icon={<SouthEastIcon />} color="error" />
            </Grid>
            <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex' }}>
              <KpiTile title="Promedio Top 10 (↑)" value={`${mean((rankings.top_approved||[]).map(c=>pct(c.approval_rate))).toFixed(1)}%`} icon={<TrendingUpIcon />} color="info" />
            </Grid>
            <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex' }}>
              <KpiTile title="Promedio Top 10 (↓)" value={`${mean((rankings.top_disapproved||[]).map(c=>pct(c.approval_rate))).toFixed(1)}%`} icon={<TrendingDownIcon />} color="warning" />
            </Grid>
          </Grid>
        )}
        {ts && !loading && (
          <Box sx={{ mt: 1 }}>
            <Chip size="small" variant="outlined" label={`Actualizado: ${ts.toLocaleString()}`} sx={{ fontWeight: 600, borderRadius: 2 }} />
          </Box>
        )}
      </Box>

      {err && <Box sx={{ mb: 2 }}><Alert severity="error" sx={{ borderRadius: 2 }}>{err}</Alert></Box>}

      {/* Rankings — side by side */}
      <Grid container spacing={2.5} alignItems="stretch">
        <Grid item xs={12} md={6} sx={{ display: 'flex' }}>
          {loading ? <Card sx={{ borderRadius: 3, p: 2, width: '100%' }}>
            {[...Array(8)].map((_, i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1 }}>
                <Skeleton variant="rounded" width={26} height={26} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton variant="text" width="80%" />
                  <Skeleton variant="rounded" height={8} />
                </Box>
                <Skeleton variant="rounded" width={64} height={24} />
              </Box>
            ))}
          </Card> :
            <CourseRankings title="Top 10 con Mayor Aprobación" data={rankings.top_approved} icon={<TrendingUpIcon />} accent="success" />
          }
        </Grid>
        <Grid item xs={12} md={6} sx={{ display: 'flex' }}>
          {loading ? <Card sx={{ borderRadius: 3, p: 2, width: '100%' }}>
            {[...Array(8)].map((_, i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1 }}>
                <Skeleton variant="rounded" width={26} height={26} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton variant="text" width="80%" />
                  <Skeleton variant="rounded" height={8} />
                </Box>
                <Skeleton variant="rounded" width={64} height={24} />
              </Box>
            ))}
          </Card> :
            <CourseRankings title="Top 10 con Menor Aprobación" data={rankings.top_disapproved} icon={<TrendingDownIcon />} accent="error" />
          }
        </Grid>
      </Grid>
    </Page>
  );
}