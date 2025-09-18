import React, { useState } from 'react';
import { Modal, Box, Typography, IconButton, Tabs, Tab, AppBar } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '90%', md: '70%', lg: '50%' },
  bgcolor: 'background.paper',
  boxShadow: 24,
  borderRadius: 2,
  p: 4,
  maxHeight: '90vh',
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
};

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const AppInfoModal = ({ open, onClose }) => {
  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="app-info-modal-title"
      aria-describedby="app-info-modal-description"
    >
      <Box sx={style}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography id="app-info-modal-title" variant="h6" component="h2">
            Información de la Aplicación
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
        <AppBar position="static" color="default" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={value} onChange={handleChange} aria-label="App Info Tabs" variant="fullWidth">
            <Tab label="Acerca de" {...a11yProps(0)} />
            <Tab label="Características" {...a11yProps(1)} />
            <Tab label="Tecnologías" {...a11yProps(2)} />
          </Tabs>
        </AppBar>
        <TabPanel value={value} index={0}>
          Esta aplicación es un sistema integral para la gestión de un chatbot, la integración con Moodle y un CRM. Su objetivo es optimizar la comunicación y la administración de estudiantes y cursos.
        </TabPanel>
        <TabPanel value={value} index={1}>
          <ul>
            <li>Gestión de usuarios y roles.</li>
            <li>Integración bidireccional con Moodle para cursos y calificaciones.</li>
            <li>Funcionalidades de CRM para seguimiento de estudiantes.</li>
            <li>Chatbot de WhatsApp con flujos de conversación personalizables.</li>
            <li>Envío de notificaciones automáticas (calificaciones, ausencias, etc.).</li>
            <li>Panel de control con KPIs y visualizaciones de datos.</li>
          </ul>
        </TabPanel>
        <TabPanel value={value} index={2}>
          <ul>
            <li>Frontend: React, Material-UI, React Router.</li>
            <li>Backend: FastAPI (Python), SQLAlchemy, PostgreSQL/MySQL.</li>
            <li>Autenticación: JWT.</li>
            <li>Integraciones: Moodle API, Twilio (para WhatsApp).</li>
          </ul>
        </TabPanel>
      </Box>
    </Modal>
  );
};

export default AppInfoModal;
