// src/components/crm/ConversationView.js

import React, { useState, useEffect } from 'react';
import { Paper, Typography, Table, TableHead, TableBody, TableRow, TableCell, TableContainer, List, ListItem, ListItemText, Divider, Checkbox, FormControlLabel, Tooltip, Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem, FormControl, InputLabel, Chip, Box } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import apiClient from '../../api/client';
import { format } from 'date-fns';

const TEMPLATE_SIDS = {
    PASSED: "HXd4eaa70446b9fa2998717a0881553efd",
    FAILED: "HXdf67b79ece430528680858878b6a269a",
    ABSENT: "HX5841cadee3381b3b5ced40b5a068b5db",
};

// ActionDialog and NoteHistoryDialog components (copied from StudentList.js)
const ActionDialog = ({ open, onClose, onSubmit, actionType, initialNote = '', initialTags = [] }) => {
    const [note, setNote] = useState(initialNote);
    const [tags, setTags] = useState(initialTags);

    const handleTagChange = (event) => {
        const {
          target: { value },
        } = event;
        setTags(
          // On autofill we get a stringified value.
          typeof value === 'string' ? value.split(',') : value,
        );
      };

    const handleSubmit = () => {
        onSubmit(note, tags);
        onClose();
        setNote('');
        setTags([]);
    };

    const handleClose = () => {
        onClose();
        setNote('');
        setTags([]);
    };

    return (
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle>Añadir Nota</DialogTitle>
            <DialogContent>
                {(actionType === 'manual_contact' || actionType === 'case_taken') && (
                    <FormControl fullWidth sx={{ mt: 2 }}>
                        <InputLabel>Etiquetas</InputLabel>
                        <Select
                            multiple
                            value={tags}
                            onChange={handleTagChange}
                        >
                            <MenuItem value="programado">Programado</MenuItem>
                            <MenuItem value="no contesta">No Contesta</MenuItem>
                            <MenuItem value="importante">Importante</MenuItem>
                        </Select>
                    </FormControl>
                )}
                <TextField
                    autoFocus
                    margin="dense"
                    label="Nota"
                    type="text"
                    fullWidth
                    variant="standard"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancelar</Button>
                <Button onClick={handleSubmit}>Guardar</Button>
            </DialogActions>
        </Dialog>
    );
};

const NoteHistoryDialog = ({ open, onClose, notes }) => {
    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Note History</DialogTitle>
            <DialogContent>
                <List>
                    {notes && notes.map((note, index) => (
                        <ListItem key={index}>
                            <ListItemText
                                primary={note.note}
                                secondary={`${note.user_name} - ${format(new Date(note.timestamp), 'Pp')}`}
                            />
                        </ListItem>
                    ))}
                </List>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
};

const ConversationView = ({ student }) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [actionType, setActionType] = useState('');
    const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
    const [selectedNotes, setSelectedNotes] = useState([]);
    const [editingActionId, setEditingActionId] = useState(null);
    const [messageActions, setMessageActions] = useState({}); // To store actions for each message

    const fetchAllMessageActions = async () => {
        if (student && student.messages) {
            const actionsMap = {};
            for (const message of student.messages) {
                try {
                    const response = await apiClient.get(`/api/crm/messages/${message.id}/actions`);
                    actionsMap[message.id] = response.data;
                } catch (error) {
                    console.error(`Error fetching actions for message ${message.id}:`, error);
                    actionsMap[message.id] = []; // Default to empty array on error
                }
            }
            setMessageActions(actionsMap);
        }
    };

    useEffect(() => {
        fetchAllMessageActions();
    }, [student]);

    const handleOpenDialog = (message, type, actionId = null, initialNote = '', initialTags = []) => {
        setSelectedMessage(message);
        setActionType(type);
        setEditingActionId(actionId);
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setSelectedMessage(null);
        setActionType('');
        setEditingActionId(null);
    };

    const handleOpenHistoryDialog = (notes) => {
        setSelectedNotes(notes);
        setHistoryDialogOpen(true);
    };

    const handleCloseHistoryDialog = () => {
        setHistoryDialogOpen(false);
        setSelectedNotes([]);
    };

    const handleDialogSubmit = async (note, tags) => {
        if (!selectedMessage || !student) return;

        try {
            let actionId;
            if (editingActionId) {
                actionId = editingActionId;
            } else {
                // 1. Create the case action
                console.log("Sending message_id:", selectedMessage.id);
                const actionResponse = await apiClient.post(`/api/crm/students/${student.student_phone}/actions`, {
                    action_type: actionType,
                    message_id: selectedMessage.id // Pass message_id
                });
                actionId = actionResponse.data.id;
            }

            // 2. Create the note for the action
            if (note || (tags && tags.length > 0)) {
                let noteContent = note || '';
                if (tags && tags.length > 0) {
                    noteContent = `[${tags.join(', ')}] ${noteContent}`;
                }
                await apiClient.post(`/api/crm/actions/${actionId}/notes`, {
                    note: noteContent
                });
            }

            // Refresh all actions for the student to ensure UI is updated
            await fetchAllMessageActions();

        } catch (error) {
            console.error("Error al actualizar la acción:", error);
        }
    };

    const getActionForMessage = (messageId, action_type) => {
        const actions = messageActions[messageId] || [];
        return actions.find(a => a.action_type === action_type);
    };

    if (!student) {
        return (
            <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography>Selecciona un estudiante para ver la conversación</Typography>
            </Paper>
        );
    }

    return (
        <Paper>
            <Typography variant="h6" sx={{ p: 2 }}>Conversación con {student.student_name}</Typography>
            <Typography variant="h6" sx={{ p: 2 }}>Resumen de Notificaciones de Exámenes</Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 2, px: 2 }}>
                {(() => {
                    const passedCount = student.messages.filter(msg => msg.template_id === TEMPLATE_SIDS.PASSED).length;
                    const failedCount = student.messages.filter(msg => msg.template_id === TEMPLATE_SIDS.FAILED).length;
                    const absentCount = student.messages.filter(msg => msg.template_id === TEMPLATE_SIDS.ABSENT).length;

                    return (
                        <>
                            {passedCount > 0 && (
                                <Chip label={`Aprobados: ${passedCount}`} color="success" />
                            )}
                            {failedCount > 0 && (
                                <Chip label={`Desaprobados: ${failedCount}`} color="warning" sx={{ backgroundColor: 'orange' }} />
                            )}
                            {absentCount > 0 && (
                                <Chip label={`Ausentes: ${absentCount}`} color="warning" sx={{ backgroundColor: 'orange' }} />
                            )}
                        </>
                    );
                })()}
            </Box>

            {
                student.course_message_exam_history && Object.keys(student.course_message_exam_history).length > 0 && (
                    <Box sx={{ mb: 2, px: 2 }}>
                        <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Historial de Exámenes por Curso</Typography>
                        {Object.entries(student.course_message_exam_history).map(([courseName, exams], courseIndex) => (
                            <Box key={courseIndex} sx={{ mb: 1 }}>
                                <Typography variant="subtitle1">{courseName}</Typography>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    {Array.from({ length: 8 }).map((_, examIndex) => {
                                        const examResult = exams[examIndex];
                                        let backgroundColor = 'grey'; // Default gray

                                        if (examResult) {
                                            if (examResult.template_id === TEMPLATE_SIDS.PASSED) {
                                                backgroundColor = 'green';
                                            } else if (examResult.template_id === TEMPLATE_SIDS.FAILED || examResult.template_id === TEMPLATE_SIDS.ABSENT) {
                                                backgroundColor = 'orange';
                                            }
                                        }

                                        return (
                                            <Tooltip key={examIndex} title={examResult ? `Plantilla: ${examResult.template_id}\nFecha: ${new Date(examResult.timestamp).toLocaleString()}` : 'Sin datos'}>
                                                <Box
                                                    sx={{
                                                        width: 20,
                                                        height: 20,
                                                        borderRadius: '50%',
                                                        backgroundColor: backgroundColor,
                                                        border: '1px solid #ccc',
                                                    }}
                                                />
                                            </Tooltip>
                                        );
                                    })}
                                </Box>
                            </Box>
                        ))}
                    </Box>
                )}
            <TableContainer component={Paper}>
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Mensaje</TableCell>
                            <TableCell>Tags</TableCell>
                            <TableCell>Remitente</TableCell>
                            <TableCell>Fecha/Hora</TableCell>
                            <TableCell>Tomar Caso</TableCell>
                            <TableCell>Contacto Manual</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {student.messages.slice().sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).map((message, index) => {
                            const sender = message.direction === 'outgoing' ? 'IFES Bot' : student.student_name;
                            const takenAction = getActionForMessage(message.id, 'case_taken');
                            const contactAction = getActionForMessage(message.id, 'manual_contact');

                            const hasProblem = message.message_body === 'Tuve un problema';
                            const needsHelp = message.message_body === 'Olvidé la fecha' || message.message_body === 'No me sentía preparado';

                            const passedExam = message.template_id === TEMPLATE_SIDS.PASSED;
                            const failedExam = message.template_id === TEMPLATE_SIDS.FAILED;
                            const isAbsent = message.template_id === TEMPLATE_SIDS.ABSENT;

                            return (
                                <TableRow key={message.id}>
                                    <TableCell>msj-{message.id}</TableCell>
                                    <TableCell>
                                        <ListItemText
                                            primary={message.message_body}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {hasProblem && <Chip label="Problema" color="error" />}
                                        {needsHelp && <Chip label="Duda" color="warning" />}
                                        {passedExam && <Chip label="Aprobado" color="success" />}
                                        {failedExam && <Chip label="Desaprobado" color="warning" sx={{ backgroundColor: 'orange' }} />}
                                        {isAbsent && <Chip label="No asistio" color="warning" sx={{ backgroundColor: 'orange' }} />}
                                    </TableCell>
                                    <TableCell>{sender}</TableCell>
                                    <TableCell>{new Date(message.timestamp).toLocaleString()}</TableCell>
                                    <TableCell>
                                        {takenAction ? (
                                            <Tooltip title={
                                                <>
                                                    <Typography color="inherit">{`${takenAction.user_name} - ${format(new Date(takenAction.timestamp), 'Pp')}`}</Typography>
                                                    {takenAction.notes && takenAction.notes.length > 0 && (
                                                        <Typography color="inherit">{`Latest Note: ${takenAction.notes[0].note}`}</Typography>
                                                    )}
                                                    <Button size="small" onClick={() => handleOpenHistoryDialog(takenAction.notes)}>View History</Button>
                                                    <IconButton size="small" onClick={() => handleOpenDialog(message, 'case_taken', takenAction.id, takenAction.notes[0]?.note || '', takenAction.notes[0]?.note?.match(/[(.*)]/)?.[1]?.split(', ') || [])}>
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                </>
                                            }>
                                                <span>
                                                    <Checkbox checked disabled />
                                                </span>
                                            </Tooltip>
                                        ) : (
                                            <Checkbox onChange={() => handleOpenDialog(message, 'case_taken')} />
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {contactAction ? (
                                            <Tooltip title={
                                                <>
                                                    <Typography color="inherit">{`${contactAction.user_name} - ${format(new Date(contactAction.timestamp), 'Pp')}`}</Typography>
                                                    {contactAction.notes && contactAction.notes.length > 0 && (
                                                        <Typography color="inherit">{`Latest Note: ${contactAction.notes[0].note}`}</Typography>
                                                    )}
                                                    <Button size="small" onClick={() => handleOpenHistoryDialog(contactAction.notes)}>View History</Button>
                                                    <IconButton size="small" onClick={() => handleOpenDialog(message, 'manual_contact', contactAction.id, contactAction.notes[0]?.note || '', contactAction.notes[0]?.note?.match(/[(.*)]/)?.[1]?.split(', ') || [])}>
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                </>
                                            }>
                                                <span>
                                                    <Checkbox checked disabled />
                                                </span>
                                            </Tooltip>
                                        ) : (
                                            <Checkbox onChange={() => handleOpenDialog(message, 'manual_contact')} />
                                        )}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
            <ActionDialog
                open={dialogOpen}
                onClose={handleCloseDialog}
                onSubmit={handleDialogSubmit}
                actionType={actionType}
                initialNote={selectedMessage?.notes?.[0]?.note || ''} // Pass initial note for editing
                initialTags={selectedMessage?.notes?.[0]?.note?.match(/[(.*)]/)?.[1]?.split(', ') || []} // Pass initial tags for editing
            />
            <NoteHistoryDialog
                open={historyDialogOpen}
                onClose={handleCloseHistoryDialog}
                notes={selectedNotes}
            />
        </Paper>
    );
};

export default ConversationView;