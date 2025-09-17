import React from 'react';
import { Typography } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer } from 'recharts';

const CrmActionsChart = ({ data, loading }) => {
    if (loading) {
        return <Typography>Cargando gráfico...</Typography>;
    }

    if (!data || data.length === 0) {
        return <Typography>No hay datos de acciones CRM para mostrar.</Typography>;
    }

    return (
        <>
            <Typography variant="h6" gutterBottom>
                Acciones CRM
            </Typography>
            <ResponsiveContainer width="100%" height="85%">
                <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value">
                        {
                            data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))
                        }
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </>
    );
};

export default CrmActionsChart;