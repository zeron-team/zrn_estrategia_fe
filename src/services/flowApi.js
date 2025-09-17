import axios from '../api/client';

const API_URL = '/api';

export const getFlows = () => {
  return axios.get(`${API_URL}/flows`);
};

export const getFlow = (flowId) => {
  return axios.get(`${API_URL}/flows/${flowId}`);
};

export const createFlow = (flowData) => {
  return axios.post(`${API_URL}/flows`, flowData);
};

export const updateFlow = (flowId, flowData) => {
  return axios.put(`${API_URL}/flows/${flowId}`, flowData);
};

export const deleteFlow = (flowId) => {
  return axios.delete(`${API_URL}/flows/${flowId}`);
};

export const setActiveFlow = (flowId) => {
  return axios.put(`${API_URL}/flows/${flowId}/active`);
};
