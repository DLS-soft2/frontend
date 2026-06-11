import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';
import { SetContextLink } from '@apollo/client/link/context';
import keycloak from '../security/keycloak';
import { settings } from '../settings';

const authLink = new SetContextLink((prevContext) => {
  if (!keycloak.token) {
    throw new Error('No auth token available');
  }
  return {
    headers: {
      ...prevContext.headers,
      Authorization: `Bearer ${keycloak.token}`,
    },
  };
});

function createClient(uri: string): ApolloClient {
  return new ApolloClient({
    link: authLink.concat(new HttpLink({ uri })),
    cache: new InMemoryCache(),
  });
}

export const userGraphqlClient = createClient(`${settings.apiBaseUrl}/graphql`);
export const restaurantGraphqlClient = createClient(`${settings.apiBaseUrl}/restaurant-graphql`);
