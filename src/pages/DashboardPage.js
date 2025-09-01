// src/pages/DashboardPage.js

import React, { useState, useEffect } from 'react';
import { Box, Grid, Typography } from '@mui/material';
import MainLayout from '../components/layout/MainLayout';
import KpiCard from '../components/dashboard/KpiCard';
import MessageTable from '../components/dashboard/MessageTable';
import apiClient from '../api/client';
import PeopleIcon from '@mui/icons-material/People';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import ForumIcon from '@mui/icons-material/Forum';

const DashboardPage = () => {
    const [kpis, setKpis] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Hacemos las llamadas reales a la API en paralelo
                const [kpisResponse, messagesResponse] = await Promise.all([
                    apiClient.get('/api/kpis'),
                    apiClient.get('/api/messages')
                ]);

                setKpis(kpisResponse.data);
                setMessages(messagesResponse.data);

            } catch (error) {
                console.error("Error al cargar los datos del dashboard", error);
                // Aquí podrías mostrar un mensaje de error al usuario
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <MainLayout><Typography>Cargando datos...</Typography></MainLayout>;

    return (
        <MainLayout>
            <Typography variant="h4" gutterBottom>
                Dashboard de Interacciones
            </Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}> {/* Ajustamos tamaño a 3 para 4 tarjetas */}
                    <KpiCard title="Total Interacciones" value={kpis ? kpis.total_interactions : 0} icon={<ForumIcon />} />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <KpiCard title="Alumnos Totales" value={kpis ? kpis.total_contacted : 0} icon={<PeopleIcon />} />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <KpiCard title="Cursos Aprobados" value={kpis ? kpis.approved : 0} icon={<ThumbUpIcon />} color="success" />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <KpiCard title="Cursos Desaprobados" value={kpis ? kpis.disapproved : 0} icon={<ThumbDownIcon />} color="error" />
                </Grid>

                <Grid item xs={12}>
                    <Box sx={{ mt: 2 }}>
                         <MessageTable messages={messages} />
                    </Box>
                </Grid>
            </Grid>
        </MainLayout>
    );
};

export default DashboardPage;