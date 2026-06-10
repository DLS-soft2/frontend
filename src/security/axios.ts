import axios from 'axios';
import { settings } from '../settings';
import keycloak from './keycloak';

export const apiClient = axios.create({
  baseURL: settings.apiBaseUrl,
});

apiClient.interceptors.request.use((config) => {
  if (!keycloak.token) {
    return Promise.reject(new Error('No auth token available'));
  }
  config.headers.Authorization = `Bearer ${keycloak.token}`;
  return config;
});
