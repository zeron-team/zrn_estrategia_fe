
import React from 'react';
import { Grid } from '@mui/material';
import KpiCard from './KpiCard';

const KpiGrid = ({ kpis }) => {
    return (
        <Grid container spacing={3} sx={{ mb: 4 }}>
            {kpis.map((kpi, index) => (
                <Grid item xs={12} sm={4} md={4} key={index}>
                    <KpiCard
                        title={kpi.title}
                        value={kpi.value}
                        icon={kpi.icon}
                        color={kpi.color}
                    />
                </Grid>
            ))}
        </Grid>
    );
};

export default KpiGrid;
