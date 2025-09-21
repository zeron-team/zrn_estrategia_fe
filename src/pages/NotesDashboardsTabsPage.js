// src/pages/NotesDashboardsTabsPage.js
import React, { useMemo, useState, lazy, Suspense, useEffect } from 'react';
import { Box, Tabs, Tab, CircularProgress } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import PieChartOutlineIcon from '@mui/icons-material/PieChartOutline';
import AssessmentIcon from '@mui/icons-material/Assessment';

// Lazy load your existing pages (they remain independent)
const ExamDebtDashboardPage = lazy(() => import('./ExamDebtDashboardPage'));
const NotesAnalyticsPage    = lazy(() => import('./NotesAnalyticsPage'));

function TabPanel({ value, index, children }) {
  if (value !== index) return null;         // unmounted when not active => fully independent
  return <Box sx={{ mt: 2 }}>{children}</Box>;
}

export default function NotesDashboardsTabsPage() {
  const theme = useTheme();

  // Optional: read initial tab from URL (?tab=debt|analytics)
  const initialTab = useMemo(() => {
    try {
      const usp = new URLSearchParams(window.location.search);
      const t = usp.get('tab');
      return t === 'analytics' ? 1 : 0;
    } catch { return 0; }
  }, []);

  const [tab, setTab] = useState(initialTab);

  // Keep URL in sync (optional; remove if you don't want this)
  useEffect(() => {
    const usp = new URLSearchParams(window.location.search);
    usp.set('tab', tab === 0 ? 'debt' : 'analytics');
    const newUrl = `${window.location.pathname}?${usp.toString()}${window.location.hash}`;
    window.history.replaceState(null, '', newUrl);
  }, [tab]);

  return (
    <Box sx={{ p: { xs: 1.5, md: 2 } }}>
      {/* Tabs header */}
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 2,
          bgcolor: (t) => alpha(t.palette.background.paper, 0.9),
          backdropFilter: 'saturate(180%) blur(6px)',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
        >
          <Tab
            icon={<PieChartOutlineIcon />}
            iconPosition="start"
            label="Exámenes Adeudados"
            sx={{ fontWeight: 700, textTransform: 'none' }}
          />
          <Tab
            icon={<AssessmentIcon />}
            iconPosition="start"
            label="Análisis de Notas"
            sx={{ fontWeight: 700, textTransform: 'none' }}
          />
        </Tabs>
      </Box>

      {/* Panels (lazy + independent) */}
      <Suspense
        fallback={
          <Box sx={{ display: 'grid', placeItems: 'center', height: 280 }}>
            <CircularProgress />
          </Box>
        }
      >
        <TabPanel value={tab} index={0}>
          {/* Renders your existing page as-is (keeps its own state & API calls) */}
          <ExamDebtDashboardPage />
        </TabPanel>

        <TabPanel value={tab} index={1}>
          <NotesAnalyticsPage />
        </TabPanel>
      </Suspense>
    </Box>
  );
}