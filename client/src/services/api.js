import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const API = axios.create({
  baseURL: `${API_BASE_URL}/api`,
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  console.log('API Request:', req.method, req.url, 'Token:', token ? 'Present' : 'Missing'); // Debugging
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// Auth functions
export const login = (credentials) => API.post('/auth/login', credentials);
export const register = (userData) => API.post('/auth/register', userData);
export const getProfile = () => API.get('/auth/profile');
export const updateProfile = (profileData) => API.put('/auth/profile', profileData);

// Expense functions
export const getExpenses = () => API.get('/expenses');
export const createExpense = (expenseData) => API.post('/expenses', expenseData);
export const updateExpense = (id, expenseData) => API.put(`/expenses/${id}`, expenseData);
export const deleteExpense = (id) => API.delete(`/expenses/${id}`);

// Recurring expense functions
export const getRecurringExpenses = () => API.get('/recurring-expenses');
export const createRecurringExpense = (recurringExpenseData) => API.post('/recurring-expenses', recurringExpenseData);
export const updateRecurringExpense = (id, recurringExpenseData) => API.put(`/recurring-expenses/${id}`, recurringExpenseData);
export const deleteRecurringExpense = (id) => API.delete(`/recurring-expenses/${id}`);
export const toggleRecurringExpense = (id) => API.patch(`/recurring-expenses/${id}/toggle`);

export default API;
