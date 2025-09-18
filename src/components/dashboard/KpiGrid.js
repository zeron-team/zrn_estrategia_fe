// src/components/dashboard/KpiGrid.js
import React from 'react';
import PropTypes from 'prop-types';
import { Grid } from '@mui/material';
import KpiCard from './KpiCard';

/**
 * KpiGrid
 * Renderiza KPIs en una grilla responsiva (3 por fila en md+).
 * Props:
 * - kpis: [{ key?, title, value, icon, color?, subtitle? }]
 * - spacing: separación entre items (default 3)
 * - cardMinHeight: alto mínimo uniforme para las tarjetas (default 136)
 */
const KpiGrid = ({ kpis = [], spacing = 3, cardMinHeight = 136 }) => {
  if (!kpis || kpis.length === 0) return null;

  return (
    <Grid container spacing={spacing} sx={{ mb: 1 }}>
      {kpis.map((k, idx) => (
        <Grid
          item
          xs={12}
          sm={6}
          md={4}
          key={k.key ?? idx}
          sx={{ display: 'flex' }}
        >
          <KpiCard
            title={k.title}
            value={k.value}
            icon={k.icon}
            color={k.color}
            subtitle={k.subtitle}
            sx={{ width: '100%', minHeight: cardMinHeight }} // alto uniforme, proporcional al frame
          />
        </Grid>
      ))}
    </Grid>
  );
};

KpiGrid.propTypes = {
  kpis: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      title: PropTypes.string.isRequired,
      value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      icon: PropTypes.node,
      color: PropTypes.string,
      subtitle: PropTypes.string,
    })
  ),
  spacing: PropTypes.number,
  cardMinHeight: PropTypes.number,
};

export default KpiGrid;