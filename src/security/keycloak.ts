import Keycloak from 'keycloak-js';
import { settings } from '../settings';

const keycloak = new Keycloak({
  url: settings.keycloakUrl,
  realm: settings.keycloakRealm,
  clientId: settings.keycloakClientId,
});

export default keycloak;
