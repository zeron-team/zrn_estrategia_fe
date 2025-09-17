// src/pages/CoursesPage.js
import React, { useEffect, useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  LinearProgress,
  IconButton,
  Skeleton,
  Alert,
  useTheme,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import MainLayout from '../components/layout/MainLayout';
import apiClient from '../api/client';

const MAX_FRAME_WIDTH = 1440;
const GAP = 16;
const LIST_ROWS = 10;

const resolveColor = (theme, colorProp) => {
  if (!colorProp) return theme.palette.primary.main;
  if (theme.palette[colorProp]?.main) return theme.palette[colorProp].main;
  if (colorProp.includes('.')) {
    const [k, shade] = colorProp.split('.');
    if (theme.palette[k]?.[shade]) return theme.palette[k][shade];
  }
  return theme.palette.primary.main;
};

const clampPercent = (v) => {
  if (v == null || isNaN(v)) return 0;
  const val = v <= 1 ? v * 100 : v;
  return Math.max(0, Math.min(100, val));
};
const formatPercent = (v) => `${clampPercent(v).toFixed(2)}%`;

const CourseRankings = ({ title, data = [], icon, color = 'primary', loading = false }) => {
  const theme = useTheme();
  const main = resolveColor(theme, color);
  const items = useMemo(() => (Array.isArray(data) ? data.slice(0, LIST_ROWS) : []), [data]);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        boxShadow:
          theme.palette.mode === 'light'
            ? '0 6px 24px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)'
            : '0 10px 30px rgba(0,0,0,0.35)',
        height: '100%',
        width: '100%',        // <- keep inside column
        minHeight: 520,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',   // <- avoid spill
        minWidth: 0,          // <- allow shrink in grid
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, minWidth: 0 }}>
        <Box
          sx={{
            width: 36, height: 36, display: 'grid', placeItems: 'center',
            borderRadius: 1.5, backgroundColor: `${main}1f`, color: main, flexShrink: 0,
          }}
        >
          {React.cloneElement(icon, { fontSize: 'small' })}
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 700, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {title}
        </Typography>
      </Box>

      <Box sx={{ overflow: 'auto', minWidth: 0 }}>
        <List dense disablePadding sx={{ minWidth: 0 }}>
          {loading
            ? Array.from({ length: LIST_ROWS }).map((_, i) => (
                <React.Fragment key={`sk-${i}`}>
                  <ListItem sx={{ py: 1.2 }}>
                    <Box sx={{ width: 28, mr: 1, display: 'grid', placeItems: 'center' }}>
                      <Skeleton variant="text" width={18} />
                    </Box>
                    <ListItemText
                      primary={<Skeleton variant="text" width="60%" />}
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5, gap: 1 }}>
                          <Skeleton variant="rectangular" height={8} sx={{ flexGrow: 1, borderRadius: 5 }} />
                          <Skeleton variant="text" width={48} />
                        </Box>
                      }
                    />
                  </ListItem>
                  {i < LIST_ROWS - 1 && <Divider component="li" />}
                </React.Fragment>
              ))
            : items.map((course, index) => {
                const percent = clampPercent(course.approval_rate);
                return (
                  <React.Fragment key={course.course_id ?? `${title}-${index}`}>
                    <ListItem sx={{ py: 1.2 }}>
                      <Box
                        sx={{
                          width: 28, mr: 1, display: 'grid', placeItems: 'center',
                          color: 'text.secondary', fontVariantNumeric: 'tabular-nums', fontSize: 12, fontWeight: 700, flexShrink: 0,
                        }}
                      >
                        {index + 1}.
                      </Box>
                      <ListItemText
                        primaryTypographyProps={{
                          noWrap: true,
                          title: course.course_name,
                          sx: { fontWeight: 600 },
                        }}
                        primary={course.course_name}
                        secondary={
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.75, gap: 1, minWidth: 0 }}>
                            <LinearProgress
                              variant="determinate"
                              value={percent}
                              sx={{
                                flexGrow: 1,
                                height: 8,
                                borderRadius: 5,
                                backgroundColor: (t) => t.palette.action.hover,
                                '& .MuiLinearProgress-bar': { backgroundColor: main },
                                minWidth: 0,
                              }}
                            />
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ width: 56, textAlign: 'right', fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}
                            >
                              {formatPercent(percent)}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < items.length - 1 && <Divider component="li" />}
                  </React.Fragment>
                );
              })}
        </List>
      </Box>
    </Paper>
  );
};

const CoursesPage = () => {
  const theme = useTheme();
  const [rankings, setRankings] = useState({ top_approved: [], top_disapproved: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRankings = async () => {
    try {
      setError(null);
      setLoading(true);
      const response = await apiClient.get('/api/courses/rankings');
      const data = response?.data || {};
      setRankings({
        top_approved: Array.isArray(data.top_approved) ? data.top_approved : [],
        top_disapproved: Array.isArray(data.top_disapproved) ? data.top_disapproved : [],
      });
    } catch (e) {
      console.error('Error al cargar los rankings de cursos', e);
      setError('No pudimos cargar los rankings. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRankings();
  }, []);

  return (
    <MainLayout>
      {/* Background ribbon consistent with other pages */}
      <Box
        sx={{
          py: { xs: 2, md: 4 },
          px: { xs: 2, md: 3 },
          background:
            theme.palette.mode === 'light'
              ? `linear-gradient(180deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`
              : theme.palette.background.default,
        }}
      >
        {/* CENTERED FRAME */}
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
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, minWidth: 0 }}>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 1 }}>
                  Cursos
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                  Análisis de Cursos
                </Typography>
              </Box>
              <IconButton aria-label="recargar" onClick={fetchRankings} size="large">
                <RefreshIcon />
              </IconButton>
            </Box>

            {/* Error */}
            {error && (
              <Box sx={{ mb: 2 }}>
                <Alert severity="error" onClose={() => setError(null)}>
                  {error}
                </Alert>
              </Box>
            )}

            {/* GRID: exact 50/50 columns on md+; single column on xs */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, // <- simpler, prevents overflow
                gap: `${GAP}px`,
                alignItems: 'stretch',
                minWidth: 0,          // <- grid container can shrink
              }}
            >
              <Box sx={{ minWidth: 0, width: '100%' }}>
                <CourseRankings
                  title="Top 10 Cursos con Mayor Aprobación"
                  data={rankings.top_approved}
                  icon={<TrendingUpIcon />}
                  color="success"
                  loading={loading}
                />
              </Box>

              <Box sx={{ minWidth: 0, width: '100%' }}>
                <CourseRankings
                  title="Top 10 Cursos con Menor Aprobación"
                  data={rankings.top_disapproved}
                  icon={<TrendingDownIcon />}
                  color="error"
                  loading={loading}
                />
              </Box>
            </Box>
          </Paper>
        </Box>
      </Box>
    </MainLayout>
  );
};

export default CoursesPage;