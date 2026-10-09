import api, { cleanParams } from './api.js';

export const listTransactions = async (params) => (await api.get('/transactions', { params: cleanParams(params) })).data;
export const getTransaction = async (id) => (await api.get(`/transactions/${id}`)).data.transaction;
export const createTransaction = async (payload) => (await api.post('/transactions', payload)).data.transaction;
export const updateTransaction = async (id, payload) => (await api.patch(`/transactions/${id}`, payload)).data.transaction;
export const deleteTransaction = async (id) => (await api.delete(`/transactions/${id}`)).data;
