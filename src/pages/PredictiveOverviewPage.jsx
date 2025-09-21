// frontend/src/pages/PredictiveOverviewPage.jsx
import React, { useEffect, useRef, useState } from 'react';
import { Box, Paper, CircularProgress, Alert, Typography } from '@mui/material';
import { getRiskByCourse, getRiskTimeSeries, getRiskHeatmap } from '../services/predictiveApi';
// import your charts...

export default function PredictiveOverviewPage() {
  const [courses, setCourses] = useState(null);
  const [series, setSeries] = useState(null);
  const [heatmap, setHeatmap] = useState(null);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(true);
  const didInit = useRef(false);

  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;

    const ac = new AbortController();
    (async () => {
      setLoading(true);
      try {
        console.log('[predictive] firing trio…');
        const [r1, r2, r3] = await Promise.allSettled([
          (async () => {
            console.log('[predictive] getRiskByCourse START');
            const data = await getRiskByCourse({ signal: ac.signal });
            console.log('[predictive] getRiskByCourse OK', data?.length);
            return data;
          })(),
          (async () => {
            const data = await getRiskTimeSeries({ signal: ac.signal });
            return data;
          })(),
          (async () => {
            const data = await getRiskHeatmap({ signal: ac.signal });
            return data;
          })(),
        ]);

        if (r1.status === 'fulfilled') setCourses(r1.value);
        else console.warn('[predictive] getRiskByCourse FAILED', r1.reason);

        if (r2.status === 'fulfilled') setSeries(r2.value);
        else console.warn('[predictive] getRiskTimeSeries FAILED', r2.reason);

        if (r3.status === 'fulfilled') setHeatmap(r3.value);
        else console.warn('[predictive] getRiskHeatmap FAILED', r3.reason);

        if ([r1, r2, r3].every(r => r.status !== 'fulfilled')) {
          setErr('No se pudieron cargar los datos predictivos.');
        }
      } finally {
        setLoading(false);
      }
    })();

    return () => ac.abort();
  }, []);

  if (loading) {
    return <Box sx={{ display: 'grid', placeItems: 'center', height: 300 }}><CircularProgress /></Box>;
  }
  if (err) return <Alert severity="error">{err}</Alert>;

  return (
    <Box sx={{ p: 2, display: 'grid', gap: 2 }}>
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>Riesgo por Curso</Typography>
        {!courses ? <Alert severity="info">Sin datos.</Alert> : (
          // <YourBarChart data={courses} isAnimationActive={false} />
          <pre style={{ margin: 0, maxHeight: 240, overflow: 'auto' }}>{JSON.stringify(courses, null, 2)}</pre>
        )}
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>Riesgo en el Tiempo</Typography>
        {!series ? <Alert severity="info">Sin datos.</Alert> : (
          // <YourLineChart data={series} isAnimationActive={false} />
          <pre style={{ margin: 0, maxHeight: 240, overflow: 'auto' }}>{JSON.stringify(series, null, 2)}</pre>
        )}
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>Heatmap</Typography>
        {!heatmap ? <Alert severity="info">Sin datos.</Alert> : (
          // <YourHeatmap data={heatmap} isAnimationActive={false} />
          <pre style={{ margin: 0, maxHeight: 240, overflow: 'auto' }}>{JSON.stringify(heatmap, null, 2)}</pre>
        )}
      </Paper>
    </Box>
  );
}