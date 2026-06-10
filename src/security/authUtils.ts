import type Keycloak from 'keycloak-js';
import type { AuthUser } from '../types/types';

export function extractRoles(keycloak: Keycloak): string[] {
  return keycloak.realmAccess?.roles ?? [];
}

export function extractUser(keycloak: Keycloak): AuthUser | null {
  if (!keycloak.tokenParsed) return null;
  const parsed = keycloak.tokenParsed;
  return {
    id: parsed.sub ?? '',
    username: parsed.preferred_username as string ?? '',
    email: parsed.email as string ?? '',
    firstName: parsed.given_name as string ?? '',
    lastName: parsed.family_name as string ?? '',
  };
}
