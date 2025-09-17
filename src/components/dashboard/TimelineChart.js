import React from 'react';
import { Typography } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const TimelineChart = ({ data, loading, color = '#8884d8' }) => {
    if (loading) {
        return <Typography>Cargando gráfico...</Typography>;
    }

    if (!data || data.length === 0) {
        return <Typography>No hay datos de mensajes para mostrar.</Typography>;
    }

    return (
        <>
            <Typography variant="h6" gutterBottom>
                Mensajes por Día (Últimos 30 días)
            </Typography>
            <ResponsiveContainer width="100%" height="85%">
                <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="count" name="Mensajes" stroke={color} activeDot={{ r: 8 }} />
                </LineChart>
            </ResponsiveContainer>
        </>
    );
};

export default TimelineChart;