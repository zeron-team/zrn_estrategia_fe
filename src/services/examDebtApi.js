// src/services/examDebtApi.js
import apiClient from '../api/client';

const buildParams = ({ dateFrom, dateTo, months, years } = {}) => {
  const p = {};
  if (dateFrom) p.date_from = dateFrom;         // 'YYYY-MM-DD'
  if (dateTo) p.date_to = dateTo;               // 'YYYY-MM-DD'
  if (months?.length) p.months = months.join(','); // 'YYYY-MM,YYYY-MM'
  if (years?.length)  p.years  = years.join(',');  // 'YYYY,YYYY'
  return p;
};

export const getExamDebtSummary = async (filters = {}) => {
  const { data } = await apiClient.get('/api/exams/debt/summary', {
    params: buildParams(filters),
  });
  return data;
};

export const getExamDebtDetails = async (bucket = '1', filters = {}) => {
  const { data } = await apiClient.get('/api/exams/debt/details', {
    params: { bucket, ...buildParams(filters) },
  });
  return data;
};

export async function getExamDebtSummaryByCourse(filters = {}) {
  const { data } = await apiClient.get('/api/exams/debt/summary_by_course', {
    params: buildParams(filters),
  });
  return Array.isArray(data) ? data : [];
}

export default {
  getExamDebtSummary,
  getExamDebtDetails,
  getExamDebtSummaryByCourse,
};