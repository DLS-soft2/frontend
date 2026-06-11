export const settings = {
  keycloakUrl: import.meta.env.VITE_KEYCLOAK_URL as string ?? 'http://localhost:8080',
  keycloakRealm: 'dls',
  keycloakClientId: 'dls-gateway',
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL as string ?? 'http://localhost:8000',
  notificationWsUrl: import.meta.env.VITE_NOTIFICATION_WS_URL as string ?? '',
} as const;
