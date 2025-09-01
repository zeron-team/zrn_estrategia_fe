// src/pages/CoursesPage.js

import React, { useState, useEffect } from 'react';
import { Box, Grid, Typography, Paper, List, ListItem, ListItemText, Divider, LinearProgress } from '@mui/material';
import MainLayout from '../components/layout/MainLayout';
import apiClient from '../api/client';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

const CourseRankings = ({ title, data, icon, color }) => (
    <Paper sx={{ p: 2, height: '100%' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            {React.cloneElement(icon, { sx: { color: color, mr: 1 }})}
            <Typography variant="h6">{title}</Typography>
        </Box>
        <List dense>
            {data.map((course, index) => (
                <React.Fragment key={course.course_id}>
                    <ListItem>
                        <ListItemText
                            primary={`${index + 1}. ${course.course_name}`}
                            secondary={
                                <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                    <LinearProgress
                                        variant="determinate"
                                        value={course.approval_rate}
                                        sx={{ flexGrow: 1, mr: 1, height: 8, borderRadius: 5 }}
                                        color={color === 'success.main' ? 'success' : 'error'}
                                    />
                                    <Typography variant="body2" color="text.secondary">
                                        {`${course.approval_rate.toFixed(2)}%`}
                                    </Typography>
                                </Box>
                            }
                        />
                    </ListItem>
                    {index < data.length - 1 && <Divider component="li" />}
                </React.Fragment>
            ))}
        </List>
    </Paper>
);


const CoursesPage = () => {
    const [rankings, setRankings] = useState({ top_approved: [], top_disapproved: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRankings = async () => {
            try {
                const response = await apiClient.get('/api/courses/rankings');
                setRankings(response.data);
            } catch (error) {
                console.error("Error al cargar los rankings de cursos", error);
            } finally {
                setLoading(false);
            }
        };
        fetchRankings();
    }, []);

    return (
        <MainLayout>
            <Typography variant="h4" gutterBottom>Análisis de Cursos</Typography>
            {loading ? (
                <Typography>Cargando rankings...</Typography>
            ) : (
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <CourseRankings
                            title="Top 10 Cursos con Mayor Aprobación"
                            data={rankings.top_approved}
                            icon={<TrendingUpIcon />}
                            color="success.main"
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <CourseRankings
                            title="Top 10 Cursos con Menor Aprobación"
                            data={rankings.top_disapproved}
                            icon={<TrendingDownIcon />}
                            color="error.main"
                        />
                    </Grid>
                </Grid>
            )}
        </MainLayout>
    );
};

export default CoursesPage;