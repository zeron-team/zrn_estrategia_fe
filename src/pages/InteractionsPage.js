// src/pages/InteractionsPage.js

import React, { useState, useEffect } from 'react';
import { Grid, Typography, Paper, TextField, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import MainLayout from '../components/layout/MainLayout';
import KpiCard from '../components/dashboard/KpiCard';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import apiClient from '../api/client';
import MessageIcon from '@mui/icons-material/Message';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import MessageTable from '../components/dashboard/MessageTable'; // Reutilizamos la tabla

const InteractionsPage = () => {
    const [kpis, setKpis] = useState({ total_interactions: 0, inbound_count: 0, outbound_count: 0 });
    const [timelineData, setTimelineData] = useState([]);
    const [tableData, setTableData] = useState([]);
    const [filters, setFilters] = useState({ student_name: '', direction: '', start_date: '', end_date: '' });

    // Cargar KPIs y datos del gráfico al montar
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const kpisRes = await apiClient.get('/api/interactions/kpis');
                setKpis(kpisRes.data);
                const timelineRes = await apiClient.get('/api/interactions/timeline');
                setTimelineData(timelineRes.data);
            } catch (error) {
                console.error("Error al cargar datos iniciales:", error);
            }
        };
        loadInitialData();
    }, []);

    // Cargar datos de la tabla cuando cambian los filtros
    useEffect(() => {
        const loadTableData = async () => {
            try {
                const tableRes = await apiClient.post('/api/interactions/table', filters);
                setTableData(tableRes.data);
            } catch (error) {
                console.error("Error al cargar datos de la tabla:", error);
            }
        };
        loadTableData();
    }, [filters]);

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    return (
        <MainLayout>
            <Typography variant="h4" gutterBottom>Análisis de Interacciones</Typography>

            {/* KPIs */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={4}><KpiCard title="Total Interacciones" value={kpis.total_interactions} icon={<MessageIcon />} /></Grid>
                <Grid item xs={12} sm={4}><KpiCard title="Mensajes Entrantes" value={kpis.inbound_count} icon={<ArrowDownwardIcon />} color="success" /></Grid>
                <Grid item xs={12} sm={4}><KpiCard title="Mensajes Salientes" value={kpis.outbound_count} icon={<ArrowUpwardIcon />} color="secondary" /></Grid>
            </Grid>

            {/* Gráfico de Línea */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6" gutterBottom>Interacciones por Día (Últimos 30 días)</Typography>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={timelineData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="count" name="Interacciones" stroke="#8884d8" activeDot={{ r: 8 }} />
                    </LineChart>
                </ResponsiveContainer>
            </Paper>

            {/* Filtros y Tabla */}
            <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>Búsqueda de Conversaciones</Typography>
                <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={12} sm={3}><TextField fullWidth label="Nombre Alumno" name="student_name" value={filters.student_name} onChange={handleFilterChange} /></Grid>
                    <Grid item xs={12} sm={3}>
                        <FormControl fullWidth>
                            <InputLabel>Dirección</InputLabel>
                            <Select name="direction" value={filters.direction} label="Dirección" onChange={handleFilterChange}>
                                <MenuItem value=""><em>Todas</em></MenuItem>
                                <MenuItem value="incoming">Entrante</MenuItem>
                                <MenuItem value="outgoing">Saliente</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={3}><TextField fullWidth label="Fecha Desde" name="start_date" type="date" InputLabelProps={{ shrink: true }} value={filters.start_date} onChange={handleFilterChange} /></Grid>
                    <Grid item xs={12} sm={3}><TextField fullWidth label="Fecha Hasta" name="end_date" type="date" InputLabelProps={{ shrink: true }} value={filters.end_date} onChange={handleFilterChange} /></Grid>
                </Grid>
                <MessageTable messages={tableData} />
            </Paper>
        </MainLayout>
    );
};

export default InteractionsPage;