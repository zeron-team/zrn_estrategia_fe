// src/components/AppInfoModal.jsx
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Box,
  Typography,
  Divider,
  Button,
  Chip,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Alert,
  IconButton,
  useTheme,
} from '@mui/material';

import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined';
import FunctionsOutlinedIcon from '@mui/icons-material/FunctionsOutlined';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CloseIcon from '@mui/icons-material/Close';

function TabPanel({ value, index, children }) {
  if (value !== index) return null;
  return <Box sx={{ mt: 2 }}>{children}</Box>;
}

export default function AppInfoModal({ open, onClose }) {
  const theme = useTheme();
  const [tab, setTab] = useState(0);

  const SectionTitle = ({ children, right }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
      <Typography variant="h6" sx={{ fontWeight: 800 }}>
        {children}
      </Typography>
      <Box sx={{ ml: 'auto' }}>{right}</Box>
    </Box>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      aria-labelledby="app-info-title"
    >
      <DialogTitle id="app-info-title" sx={{ pr: 7 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <InfoOutlinedIcon />
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            Información y Ayuda
          </Typography>
          <Box sx={{ ml: 'auto' }}>
            <IconButton aria-label="Cerrar" onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>

      <Divider />

      <Box sx={{ px: 3, pt: 1 }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          variant="scrollable"
          allowScrollButtonsMobile
        >
          <Tab icon={<InfoOutlinedIcon />} iconPosition="start" label="General" />
          <Tab icon={<InsightsOutlinedIcon />} iconPosition="start" label="Predictivo" />
          <Tab icon={<FunctionsOutlinedIcon />} iconPosition="start" label="Fórmula (ELI5)" />
          <Tab icon={<HelpOutlineIcon />} iconPosition="start" label="Cómo usarlo" />
        </Tabs>
      </Box>

      <DialogContent dividers sx={{ pt: 2 }}>
        {/* GENERAL */}
        <TabPanel value={tab} index={0}>
          <SectionTitle>¿Qué es esta aplicación?</SectionTitle>
          <Typography paragraph>
            Esta plataforma reúne la información académica (Moodle) y de gestión (CRM) en un solo
            lugar. Te permite visualizar métricas, segmentar alumnos y tomar decisiones rápidas.
          </Typography>
          <Typography paragraph>
            En particular, el módulo <strong>Dashboard Predictivo</strong> resalta alumnos que
            podrían necesitar acompañamiento, combinando señales simples (reprobaciones y ausencias)
            en un puntaje fácil de entender.
          </Typography>
          <Alert severity="info">
            Todo lo que ves es explicable: no hay “caja negra”. Los pesos y el umbral se pueden
            ajustar según la política de la institución.
          </Alert>
        </TabPanel>

        {/* PREDICTIVO (QUÉ MUESTRA CADA GRÁFICO) */}
        <TabPanel value={tab} index={1}>
          <SectionTitle
            right={
              <Chip
                size="small"
                label="Umbral por defecto: min_score = 50"
                sx={{
                  bgcolor: theme.palette.mode === 'light'
                    ? 'rgba(211,47,47,0.08)'
                    : 'rgba(211,47,47,0.18)',
                  color: 'error.main',
                  fontWeight: 700,
                }}
              />
            }
          >
            Dashboard Predictivo — ¿qué muestra?
          </SectionTitle>

          <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 1 }}>
            1) Top cursos en riesgo
          </Typography>
          <Typography paragraph>
            Barras con los cursos que tienen <strong>más alumnos en riesgo</strong>. Una barra más
            larga significa más casos. Si hacés <em>clic</em> en una barra, se abre la
            <strong> tabla de alumnos</strong> del curso con sus puntajes.
          </Typography>

          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            2) Alumnos en riesgo por mes
          </Typography>
          <Typography paragraph>
            Línea que muestra la suma de alumnos en riesgo (de todos los cursos) por mes. La parte
            punteada es una <strong>proyección simple</strong> (promedio de los últimos 3 meses).
            Útil para ver si las acciones están bajando la curva.
          </Typography>

          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            3) Heatmap (mapa de calor)
          </Typography>
          <Typography paragraph>
            Matriz con <em>filas = cursos</em> y <em>columnas = meses</em>. Cuanto más oscuro, más
            alumnos en riesgo hubo en ese curso ese mes. Sirve para detectar <strong>picos</strong>
            (por ejemplo, después de parciales).
          </Typography>

          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            4) Tabla de alumnos (drill-down)
          </Typography>
          <Typography paragraph>
            Detalle de cada alumno del curso seleccionado: nombre, email,
            <em>reprobaciones</em>, <em>ausencias</em>, último período, <em>puntaje de riesgo</em> y
            un <em>bucket</em> (rótulo) que resume el patrón, por ejemplo:
            <em> “reprobó 2 veces (mismo curso)”</em>.
          </Typography>
        </TabPanel>

        {/* FÓRMULA ELI5 */}
        <TabPanel value={tab} index={2}>
          <SectionTitle>Fórmula de riesgo </SectionTitle>
          <Typography paragraph>
            Pensalo como una <strong>mochila de puntos de alerta</strong> que lleva cada alumno en
            cada curso. Cuantos más puntos junta, más atención necesita.
          </Typography>

          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            ¿Cómo se suman los puntos?
          </Typography>
          <ul>
            <li><strong>Aprobó</strong>: 0 puntos (todo bien)</li>
            <li><strong>Reprobó</strong>: <strong>+35</strong> puntos</li>
            <li><strong>Ausente</strong> (no hay nota): <strong>+25</strong> puntos</li>
          </ul>
          <Typography paragraph>
            Si en el mismo curso hay <strong>reprobaciones y ausencias</strong>, sumamos
            <strong> +10</strong> extra (es una combinación más preocupante).
          </Typography>

          <Typography
            component="pre"
            sx={{
              p: 2,
              borderRadius: 2,
              border: '1px dashed',
              borderColor: 'divider',
              bgcolor: theme.palette.mode === 'light' ? 'grey.50' : 'grey.900',
              overflow: 'auto',
              fontFamily: 'monospace',
            }}
          >
{`Riesgo = (Reprobados × 35) + (Ausencias × 25) + (10 si hay ambas)
El puntaje se "capa" en 100 (máximo). Si Riesgo ≥ min_score (por defecto 50) ⇒ "en riesgo".`}
          </Typography>

          <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 2 }}>
            Ejemplos rápidos
          </Typography>

          <Table size="small" sx={{ mt: 1, mb: 2 }}>
            <TableHead>
              <TableRow>
                <TableCell align="right">Reprobados</TableCell>
                <TableCell align="right">Ausencias</TableCell>
                <TableCell>Cálculo</TableCell>
                <TableCell align="right">Puntaje</TableCell>
                <TableCell>¿En riesgo? (≥ 50)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell align="right">1</TableCell>
                <TableCell align="right">0</TableCell>
                <TableCell>1×35</TableCell>
                <TableCell align="right">35</TableCell>
                <TableCell>❌ No</TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="right">0</TableCell>
                <TableCell align="right">2</TableCell>
                <TableCell>2×25</TableCell>
                <TableCell align="right">50</TableCell>
                <TableCell>✅ Sí</TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="right">1</TableCell>
                <TableCell align="right">1</TableCell>
                <TableCell>1×35 + 1×25 + 10</TableCell>
                <TableCell align="right">70</TableCell>
                <TableCell>✅ Sí</TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="right">2</TableCell>
                <TableCell align="right">0</TableCell>
                <TableCell>2×35</TableCell>
                <TableCell align="right">70</TableCell>
                <TableCell>✅ Sí</TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="right">3</TableCell>
                <TableCell align="right">1</TableCell>
                <TableCell>3×35 + 1×25 + 10 = 140 → tope 100</TableCell>
                <TableCell align="right">100</TableCell>
                <TableCell>✅ Sí</TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <Alert severity="success">
            <strong>Clave:</strong> reprobar pesa más que faltar, y tener ambas cosas juntas
            dispara más la alerta. El umbral (<em>min_score</em>) se puede ajustar (por ejemplo 45 o 60).
          </Alert>
        </TabPanel>

        {/* CÓMO USARLO */}
        <TabPanel value={tab} index={3}>
          <SectionTitle>Cómo usar el dashboard sin ser técnico</SectionTitle>
          <ol>
            <li>
              <strong>Priorizar:</strong> mirá “Top cursos en riesgo” y empezá por los de arriba.
            </li>
            <li>
              <strong>Actuar a tiempo:</strong> en la tabla del curso, contactá a quienes tienen
              puntajes más altos (tutorías, recordatorios, acompañamiento).
            </li>
            <li>
              <strong>Calendario inteligente:</strong> si el heatmap marca un mes crítico, reforzá
              antes con consultorías o guías de estudio.
            </li>
            <li>
              <strong>Medir impacto:</strong> verificá la línea mensual en las semanas siguientes;
              si baja, tu intervención está funcionando.
            </li>
            <li>
              <strong>Ajustar umbral:</strong> si ves demasiados o muy pocos casos, mové el{' '}
              <em>min_score</em> y observá cómo cambian los gráficos.
            </li>
          </ol>
          <Alert severity="info">
            Todo el cálculo es trazable y auditable. Si querés, podemos ajustar los pesos o añadir
            reglas específicas para tu institución.
          </Alert>
        </TabPanel>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="contained">Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
}