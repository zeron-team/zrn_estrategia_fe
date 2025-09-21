// frontend/src/services/analyticsApi.js
import apiClient from '../api/client';

/**
 * Safely build params object, omitting null/undefined.
 */
const buildParams = (obj = {}) =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== null && v !== undefined));

/**
 * Extract bucket dict from the KPIs payload using any supported key.
 */
const extractBucketsFromKpis = (kpis) =>
  kpis?.student_failure_absence_buckets ||
  kpis?.failure_absence_buckets ||
  kpis?.buckets ||
  {};

/**
 * GET /api/notes/analytics/kpis
 * Returns the full KPIs payload:
 * {
 *   total_notes,
 *   notes_by_status,
 *   notes_by_status_over_time,
 *   student_failure_absence_buckets (or failure_absence_buckets)
 * }
 */
export const getNotesAnalyticsKpis = async () => {
  try {
    const { data } = await apiClient.get('/api/notes/analytics/kpis');
    return data;
  } catch (error) {
    console.error('Error fetching notes analytics KPIs:', error);
    throw error;
  }
};

/**
 * GET /api/notes/analytics/courses_by_month/{month}?limit=#
 * @param {string} month - format "YYYY-MM"
 * @param {number|null|'all'} limit - numeric limit or 'all' to omit the param
 */
export const getCourseDetailsForMonth = async (month, limit = null) => {
  try {
    const params =
      limit === 'all' ? {} : buildParams({ limit: typeof limit === 'number' ? limit : null });
    const { data } = await apiClient.get(`/api/notes/analytics/courses_by_month/${month}`, {
      params,
    });
    return data;
  } catch (error) {
    console.error(`Error fetching course details for month ${month}:`, error);
    throw error;
  }
};

/**
 * NEW: GET /api/notes/analytics/buckets/detail?bucket=<key>
 * Drill-down for a specific bucket. Returns:
 * [{ user_id, firstname, lastname, email, course_id, course_name, failed_count, absent_count }]
 *
 * Valid keys:
 * - fail_1_same_course
 * - fail_2_same_course
 * - fail_gt_2_same_course
 * - absent_1_same_course
 * - absent_2_same_course
 * - absent_1_fail_1_same_course
 * - absent_gt_1_fail_gt_1_same_course
 */
export const getBucketDetails = async (bucketKey) => {
  try {
    const { data } = await apiClient.get('/api/notes/analytics/buckets/detail', {
      params: { bucket: bucketKey },
    });
    return data;
  } catch (error) {
    console.error(`Error fetching bucket details for ${bucketKey}:`, error);
    throw error;
  }
};

/**
 * Backward-compat helper (optional):
 * If some part of the UI still calls this, we read buckets from KPIs.
 * Shape returned is the buckets object directly.
 */
export const getFailureAbsenceSummary = async () => {
  try {
    const kpis = await getNotesAnalyticsKpis();
    return extractBucketsFromKpis(kpis);
  } catch (error) {
    console.error('Error fetching failure/absence summary:', error);
    throw error;
  }
};