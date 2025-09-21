// src/services/predictiveApi.js
import apiClient from '../api/client';

// Small helper to enforce a max wait and allow aborts if desired.
const withTimeout = (promise, ms, controller) =>
  Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => {
        try { controller?.abort?.(); } catch {}
        reject(new Error('Request timed out'));
      }, ms)
    ),
  ]);

/**
 * Overview: at-risk counts by course
 * GET /api/predictive/overview/risk_by_course
 * Named export REQUIRED by PredictiveDashboardPage
 */
export const getRiskByCourseOverview = async ({
  minScore = 50,
  limit = 12,
  signal,
  timeoutMs = 8000,
} = {}) => {
  const controller = signal ? null : new AbortController();
  const cfg = { params: { min_score: minScore, limit }, signal: signal || controller?.signal };
  const res = await withTimeout(
    apiClient.get('/api/predictive/overview/risk_by_course', cfg),
    timeoutMs,
    controller
  );
  return res.data;
};

// Back-compat alias (if any old code was using getRiskByCourse)
export const getRiskByCourse = async ({ min_score = 50, limit = 12, signal } = {}) => {
  const controller = signal ? null : new AbortController();
  const cfg = { params: { min_score, limit }, signal: signal || controller?.signal };
  // bump from 8s → 20s
  const res = await withTimeout(apiClient.get('/api/predictive/overview/risk_by_course', cfg), 20000, controller);
  return res.data;
};

/**
 * Monthly time series (with optional forecast)
 * GET /api/predictive/overview/risk_time_series
 */
export const getRiskTimeSeries = async ({
  minScore = 50,
  monthsBack = 12,
  includeForecast = true,
  forecastHorizon = 3,
  signal,
} = {}) => {
  const { data } = await apiClient.get('/api/predictive/overview/risk_time_series', {
    params: {
      min_score: minScore,
      months_back: monthsBack,
      include_forecast: includeForecast,
      forecast_horizon: forecastHorizon,
    },
    signal,
  });
  return data;
};

/**
 * Heatmap data per (course, period)
 * GET /api/predictive/overview/heatmap
 */
export const getRiskHeatmap = async ({
  minScore = 50,
  monthsBack = 6,
  topCourses = 18,
  signal,
} = {}) => {
  const { data } = await apiClient.get('/api/predictive/overview/heatmap', {
    params: {
      min_score: minScore,
      months_back: monthsBack,
      top_courses: topCourses,
    },
    signal,
  });
  return data;
};

/**
 * Drill-down: at-risk students list
 * GET /api/predictive/at_risk_students
 */
export const getAtRiskStudents = async ({
  minScore = 50,
  courseId,
  period,
  limit = 200,
  signal,
} = {}) => {
  const params = { min_score: minScore, limit };
  if (courseId != null) params.course_id = courseId;
  if (period) params.period = period;

  const { data } = await apiClient.get('/api/predictive/at_risk_students', {
    params,
    signal,
  });
  return data;
};

// Optional default export (handy for grouped imports)
export default {
  getRiskByCourseOverview,
  getRiskByCourse, // alias
  getRiskTimeSeries,
  getRiskHeatmap,
  getAtRiskStudents,
};