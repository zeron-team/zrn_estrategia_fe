import React from 'react';
import { Modal, Box, Typography, IconButton, Link } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PhoneIcon from '@mui/icons-material/Phone';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import EmailIcon from '@mui/icons-material/Email';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '90%', md: '50%' },
  bgcolor: 'background.paper',
  boxShadow: 24,
  borderRadius: 2,
  p: 4,
  maxHeight: '90vh',
  overflowY: 'auto',
};

const ContactModal = ({ open, onClose }) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="contact-modal-title"
      aria-describedby="contact-modal-description"
    >
      <Box sx={style}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography id="contact-modal-title" variant="h6" component="h2">
            Contacto
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Typography id="contact-modal-description" sx={{ mt: 2 }}>
          Si tienes alguna pregunta o problema, no dudes en contactarnos a través de los siguientes medios:
        </Typography>
        <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <PhoneIcon sx={{ mr: 1 }} />
            <Typography variant="body1">
              Teléfono: <Link href="tel:+5491112345678" target="_blank" rel="noopener noreferrer">+54 9 11 1234-5678</Link>
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <WhatsAppIcon sx={{ mr: 1 }} />
            <Typography variant="body1">
              WhatsApp: <Link href="https://wa.me/5491112345678" target="_blank" rel="noopener noreferrer">+54 9 11 1234-5678</Link>
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <EmailIcon sx={{ mr: 1 }} />
            <Typography variant="body1">
              Email: <Link href="mailto:info@zeron.com.ar" target="_blank" rel="noopener noreferrer">info@zeron.com.ar</Link>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
};

export default ContactModal;
