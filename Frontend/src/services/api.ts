import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  timeout: 8000,
});