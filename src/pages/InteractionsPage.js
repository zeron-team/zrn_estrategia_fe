// src/pages/InteractionsPage.js

import React, { useState, useEffect } from 'react';
import { Grid, Typography, Paper, TextField } from '@mui/material';
import MainLayout from '../components/layout/MainLayout';
import apiClient from '../api/client';
import StudentList from '../components/crm/StudentList';
import ConversationView from '../components/crm/ConversationView';

const InteractionsPage = () => {
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [filters, setFilters] = useState({ student_name: '', start_date: '', end_date: '' });

    useEffect(() => {
        const loadStudents = async () => {
            try {
                const response = await apiClient.post('/api/crm/messages', filters);
                setStudents(response.data);
            } catch (error) {
                console.error("Error al cargar los estudiantes:", error);
            }
        };
        loadStudents();
    }, [filters]);

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    return (
        <MainLayout>
            <Typography variant="h4" gutterBottom>Interacciones de Estudiantes</Typography>
            <Paper sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6" gutterBottom>Filtros</Typography>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}><TextField fullWidth label="Nombre Alumno" name="student_name" value={filters.student_name} onChange={handleFilterChange} /></Grid>
                    <Grid item xs={12} sm={4}><TextField fullWidth label="Fecha Desde" name="start_date" type="date" InputLabelProps={{ shrink: true }} value={filters.start_date} onChange={handleFilterChange} /></Grid>
                    <Grid item xs={12} sm={4}><TextField fullWidth label="Fecha Hasta" name="end_date" type="date" InputLabelProps={{ shrink: true }} value={filters.end_date} onChange={handleFilterChange} /></Grid>
                </Grid>
            </Paper>
            <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                    <StudentList students={students} onSelectStudent={setSelectedStudent} />
                </Grid>
                <Grid item xs={12} md={8}>
                    <ConversationView student={selectedStudent} />
                </Grid>
            </Grid>
        </MainLayout>
    );
};

export default InteractionsPage;
