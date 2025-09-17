import React, { useState, useEffect } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import MainLayout from '../components/layout/MainLayout';
import { getUsers, createUser, updateUser, deleteUser } from '../services/userApi';

const UserManagementPage = () => {
    const [users, setUsers] = useState([]);
    const [open, setOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        lastname: '',
        username: '',
        email: '',
        phone_number: '',
        password: '',
        repeat_password: ''
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await getUsers();
            setUsers(response.data);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    const handleOpen = (user = null) => {
        setCurrentUser(user);
        setFormData(user ? { ...user, password: '', repeat_password: '' } : {
            name: '',
            lastname: '',
            username: '',
            email: '',
            phone_number: '',
            password: '',
            repeat_password: ''
        });
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setCurrentUser(null);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        if (formData.password !== formData.repeat_password) {
            alert("Passwords do not match!");
            return;
        }

        try {
            if (currentUser) {
                await updateUser(currentUser.id, formData);
            } else {
                await createUser(formData);
            }
            fetchUsers();
            handleClose();
        } catch (error) {
            console.error("Error saving user:", error);
        }
    };

    const handleDelete = async (userId) => {
        if (window.confirm("Are you sure you want to delete this user?")) {
            try {
                await deleteUser(userId);
                fetchUsers();
            } catch (error) {
                console.error("Error deleting user:", error);
            }
        }
    };

    return (
        <MainLayout>
            <Box sx={{ p: 3 }}>
                <Button variant="contained" onClick={() => handleOpen()}>Create User</Button>
                <TableContainer component={Paper} sx={{ mt: 3 }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>Lastname</TableCell>
                                <TableCell>Username</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Phone</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>{user.name}</TableCell>
                                    <TableCell>{user.lastname}</TableCell>
                                    <TableCell>{user.username}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>{user.phone_number}</TableCell>
                                    <TableCell>
                                        <IconButton onClick={() => handleOpen(user)}><Edit /></IconButton>
                                        <IconButton onClick={() => handleDelete(user.id)}><Delete /></IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Dialog open={open} onClose={handleClose}>
                    <DialogTitle>{currentUser ? 'Edit User' : 'Create User'}</DialogTitle>
                    <DialogContent>
                        <TextField name="name" label="Name" value={formData.name} onChange={handleChange} fullWidth margin="dense" />
                        <TextField name="lastname" label="Lastname" value={formData.lastname} onChange={handleChange} fullWidth margin="dense" />
                        <TextField name="username" label="Username" value={formData.username} onChange={handleChange} fullWidth margin="dense" />
                        <TextField name="email" label="Email" value={formData.email} onChange={handleChange} fullWidth margin="dense" />
                        <TextField name="phone_number" label="Phone Number" value={formData.phone_number} onChange={handleChange} fullWidth margin="dense" />
                        <TextField name="password" label="Password" type="password" value={formData.password} onChange={handleChange} fullWidth margin="dense" />
                        <TextField name="repeat_password" label="Repeat Password" type="password" value={formData.repeat_password} onChange={handleChange} fullWidth margin="dense" />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose}>Cancel</Button>
                        <Button onClick={handleSubmit}>Save</Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </MainLayout>
    );
};

export default UserManagementPage;
