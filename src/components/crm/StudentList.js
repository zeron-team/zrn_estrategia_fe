// src/components/crm/StudentList.js

import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Select, MenuItem, FormControl, InputLabel, List, ListItem, ListItemText, Chip } from '@mui/material';
import apiClient from '../../api/client';
import { format } from 'date-fns';

const TEMPLATE_SIDS = {
    PASSED: "HXd4eaa70446b9fa2998717a0881553efd",
    FAILED: "HXdf67b79ece430528680858878b6a269a",
    ABSENT: "HX5841cadee3381b3b5ced40b5a068b5db",
};

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
                {actionType === 'manual_contact' && (
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

const StudentList = ({ students, onSelectStudent, setStudents }) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [actionType, setActionType] = useState('');
    const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
    const [selectedNotes, setSelectedNotes] = useState([]);
    const [editingActionId, setEditingActionId] = useState(null); // New state for editing

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setSelectedStudent(null);
        setActionType('');
        setEditingActionId(null); // Clear editing state
    };

    const handleCloseHistoryDialog = () => {
        setHistoryDialogOpen(false);
        setSelectedNotes([]);
    };

    const handleDialogSubmit = async (note, tags) => {
        if (!selectedStudent) return;

        try {
            let actionId;
            if (editingActionId) {
                actionId = editingActionId;
            } else {
                // 1. Create the case action
                const actionResponse = await apiClient.post(`/api/crm/students/${selectedStudent.student_phone}/actions`, { 
                    action_type: actionType
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

            // 3. Refresh the student list
            const response = await apiClient.post('/api/crm/messages', {});
            setStudents(response.data);
        } catch (error) {
            console.error("Error al actualizar la acción:", error);
        }
    };

    return (
        <>
            <TableContainer component={Paper}>
                <Typography variant="h6" sx={{ p: 2 }}>Estudiantes</Typography>
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell>Nombre</TableCell>
                            <TableCell>Último Mensaje</TableCell>
                            <TableCell>Tags</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {students.map((student) => {
                            const lastMessage = student.messages && student.messages.length > 0 ? student.messages[student.messages.length - 1] : null;
                            const lastMessageBody = lastMessage ? lastMessage.message_body : '';

                            let tag = null;
                            if (student.messages) {
                                for (let i = student.messages.length - 1; i >= 0; i--) {
                                    const message = student.messages[i];
                                    if (message.template_id === TEMPLATE_SIDS.PASSED) {
                                        tag = <Chip label="Aprobado" color="success" />;
                                        break;
                                    }
                                    if (message.template_id === TEMPLATE_SIDS.FAILED) {
                                        tag = <Chip label="Desaprobado" color="warning" sx={{ backgroundColor: 'orange' }} />;
                                        break;
                                    }
                                    if (message.template_id === TEMPLATE_SIDS.ABSENT) {
                                        tag = <Chip label="No asistio" color="warning" sx={{ backgroundColor: 'orange' }} />;
                                        break;
                                    }
                                    if (message.message_body === 'Tuve un problema') {
                                        tag = <Chip label="Problema" color="error" />;
                                        break;
                                    }
                                    if (message.message_body === 'Olvidé la fecha' || message.message_body === 'No me sentía preparado') {
                                        tag = <Chip label="Duda" color="warning" />;
                                        break;
                                    }
                                }
                            }

                            return (
                                <TableRow key={student.student_phone} hover>
                                    <TableCell onClick={() => onSelectStudent(student)} style={{ cursor: 'pointer' }}>{student.student_name}</TableCell>
                                    <TableCell onClick={() => onSelectStudent(student)} style={{ cursor: 'pointer' }}>
                                        {lastMessageBody || 'No messages'}
                                    </TableCell>
                                    <TableCell>
                                        {tag}
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
                initialNote={selectedStudent?.notes?.[0]?.note || ''}
                initialTags={selectedStudent?.notes?.[0]?.note?.match(/[(.*)]/)?.[1]?.split(', ') || []}
            />
            <NoteHistoryDialog
                open={historyDialogOpen}
                onClose={handleCloseHistoryDialog}
                notes={selectedNotes}
            />
        </>
    );
};

export default StudentList;