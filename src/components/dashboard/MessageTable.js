// src/components/dashboard/MessageTable.js

import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Typography, Box } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SmartToyIcon from '@mui/icons-material/SmartToy';

const MessageTable = ({ messages = [] }) => {

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'medium' });
  };

  // Función para mostrar el nombre o el número si no hay nombre
  const renderParticipant = (name, id, isBot) => (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      {isBot ? <SmartToyIcon sx={{ mr: 1, color: 'text.secondary' }} /> : <AccountCircleIcon sx={{ mr: 1, color: 'text.secondary' }} />}
      <Box>
        <Typography variant="body2" fontWeight="bold">
          {name || (isBot ? 'Bot' : 'Desconocido')}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {id}
        </Typography>
      </Box>
    </Box>
  );

  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="conversation table">
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold' }}>Remitente</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Destinatario</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Dirección</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Mensaje</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>Fecha y Hora</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {messages.map((msg, index) => (
            <TableRow key={msg.id || index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
              <TableCell>
                {renderParticipant(msg.sender_name, msg.sender_id, msg.direction === 'outgoing')}
              </TableCell>
              <TableCell>
                {renderParticipant(msg.receiver_name, msg.to_id, msg.direction === 'incoming')}
              </TableCell>
              <TableCell>
                <Chip
                  label={msg.direction === 'incoming' ? 'Entrante' : 'Saliente'}
                  color={msg.direction === 'incoming' ? 'primary' : 'secondary'}
                  size="small"
                />
              </TableCell>
              <TableCell sx={{ maxWidth: 400, wordBreak: 'break-word' }}>
                {msg.message_body}
              </TableCell>
              <TableCell align="right">{formatTimestamp(msg.timestamp)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default MessageTable;