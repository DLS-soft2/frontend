import { gql } from '@apollo/client';
import { userGraphqlClient } from '../lib/apolloClient';
import type { User, UserCreateInput, UserUpdateInput } from '../types/user';

const USER_FIELDS = gql`
  fragment UserFields on UserType {
    id
    keycloakId
    email
    fullName
    phone
    defaultAddress
    createdAt
    updatedAt
  }
`;

export const GET_USER_BY_KEYCLOAK_ID = gql`
  query GetUserByKeycloakId($keycloakId: String!) {
    userByKeycloakId(keycloakId: $keycloakId) {
      ...UserFields
    }
  }
  ${USER_FIELDS}
`;

export const CREATE_USER = gql`
  mutation CreateUser($input: UserCreateInput!) {
    createUser(input: $input) {
      ...UserFields
    }
  }
  ${USER_FIELDS}
`;

export const UPDATE_USER = gql`
  mutation UpdateUser($userId: UUID!, $input: UserUpdateInput!) {
    updateUser(userId: $userId, input: $input) {
      ...UserFields
    }
  }
  ${USER_FIELDS}
`;

export async function fetchUserByKeycloakId(keycloakId: string): Promise<User | null> {
  const { data } = await userGraphqlClient.query<{ userByKeycloakId: User | null }>({
    query: GET_USER_BY_KEYCLOAK_ID,
    variables: { keycloakId },
    fetchPolicy: 'network-only',
  });
  return data?.userByKeycloakId ?? null;
}

export async function createUserProfile(input: UserCreateInput): Promise<User> {
  const { data } = await userGraphqlClient.mutate<{ createUser: User }>({
    mutation: CREATE_USER,
    variables: { input },
  });
  if (!data) {
    throw new Error('createUser mutation returned no data');
  }
  return data.createUser;
}

export async function updateUserProfile(userId: string, input: UserUpdateInput): Promise<User> {
  const { data } = await userGraphqlClient.mutate<{ updateUser: User | null }>({
    mutation: UPDATE_USER,
    variables: { userId, input },
  });
  if (!data?.updateUser) {
    throw new Error('updateUser mutation returned no data');
  }
  return data.updateUser;
}
