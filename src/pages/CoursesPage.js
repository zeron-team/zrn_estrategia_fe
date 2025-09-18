import React, { useEffect, useState } from 'react';
import {
  Grid,
  Card,
  CardHeader,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
  LinearProgress,
  Typography,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
  import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import Page from '../components/layout/Page';
import apiClient from '../api/client';

function CourseRankings({ title, data, icon, color }) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader
        title={title}
        avatar={icon}
        titleTypographyProps={{ variant: 'h6' }}
      />
      <CardContent>
        {data.length === 0 ? (
          <Typography variant="body2" color="text.secondary">Sin datos</Typography>
        ) : (
          <List dense>
            {data.map((course, index) => (
              <React.Fragment key={course.course_id}>
                <ListItem alignItems="flex-start">
                  <ListItemText
                    primary={`${index + 1}. ${course.course_name}`}
                    secondary={
                      <div style={{ display: 'flex', alignItems: 'center', marginTop: 6 }}>
                        <LinearProgress
                          variant="determinate"
                          value={course.approval_rate}
                          sx={{ flexGrow: 1, mr: 1, height: 8, borderRadius: 5 }}
                          color={color === 'success' ? 'success' : 'error'}
                        />
                        <Typography variant="body2" color="text.secondary">
                          {`${course.approval_rate.toFixed(2)}%`}
                        </Typography>
                      </div>
                    }
                  />
                </ListItem>
                {index < data.length - 1 && <Divider component="li" />}
              </React.Fragment>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
}

export default function CoursesPage() {
  const [rankings, setRankings] = useState({ top_approved: [], top_disapproved: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        const res = await apiClient.get('/api/courses/rankings');
        setRankings(res.data || { top_approved: [], top_disapproved: [] });
      } catch (e) {
        // silent
      } finally {
        setLoading(false);
      }
    };
    fetchRankings();
  }, []);

  return (
    <Page title="Análisis de Cursos">
      {loading ? (
        <Typography>Cargando rankings…</Typography>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <CourseRankings
              title="Top 10 Cursos con Mayor Aprobación"
              data={rankings.top_approved}
              icon={<TrendingUpIcon color="success" />}
              color="success"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <CourseRankings
              title="Top 10 Cursos con Menor Aprobación"
              data={rankings.top_disapproved}
              icon={<TrendingDownIcon color="error" />}
              color="error"
            />
          </Grid>
        </Grid>
      )}
    </Page>
  );
}