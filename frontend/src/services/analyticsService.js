import api, { cleanParams } from './api.js';

export const getSummary = async (params) => (await api.get('/analytics/summary', { params: cleanParams(params) })).data;
export const getTrend = async (params) => (await api.get('/analytics/monthly', { params: cleanParams(params) })).data;
export const getCategories = async (params) => (await api.get('/analytics/categories', { params: cleanParams(params) })).data;
