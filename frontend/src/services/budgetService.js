import api, { cleanParams } from './api.js';

export const listBudgets = async (params) => (await api.get('/budgets', { params: cleanParams(params) })).data.budgets;
export const createBudget = async (payload) => (await api.post('/budgets', payload)).data.budget;
export const updateBudget = async (id, payload) => (await api.patch(`/budgets/${id}`, payload)).data.budget;
export const deleteBudget = async (id) => (await api.delete(`/budgets/${id}`)).data;
