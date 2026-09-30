import axios from 'axios';

export const api = axios.create({
  baseURL: 'https://timeline-backend-mhx7.onrender.com/api',
  timeout: 30000,
});