import apiClient from '../api/client';

export const getUsers = () => apiClient.get('/api/users/');
export const createUser = (userData) => apiClient.post('/api/users/', userData);
export const updateUser = (userId, userData) => apiClient.put(`/api/users/${userId}`, userData);
export const deleteUser = (userId) => apiClient.delete(`/api/users/${userId}`);
export const getMe = () => apiClient.get('/api/users/me');
