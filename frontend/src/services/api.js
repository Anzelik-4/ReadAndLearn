 import axios from 'axios';

// Базовый URL вашего Django-сервера
const API_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Автоматически добавлять токен к запросам
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// API для материалов
export const getMaterials = (params) => api.get('/materials/', { params });
export const getMaterial = (id) => api.get(`/materials/${id}/`);
export const getCategories = () => api.get('/categories/');
export const getTypes = () => api.get('/types/');

// API для избранного
export const getFavorites = () => api.get('/favorites/');
export const toggleFavorite = (materialId) => api.post('/favorites/toggle/', { material_id: materialId });

// API для авторизации
export const login = (email, password) => api.post('/auth/login/', { email, password });
export const register = (userData) => api.post('/auth/register/', userData);

export default api;
