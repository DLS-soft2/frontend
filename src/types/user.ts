export interface User {
  id: string;
  keycloakId: string;
  email: string;
  fullName: string;
  phone: string | null;
  defaultAddress: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserCreateInput {
  keycloakId: string;
  email: string;
  fullName: string;
  phone?: string;
  defaultAddress?: string;
}

export interface UserUpdateInput {
  email?: string;
  fullName?: string;
  phone?: string;
  defaultAddress?: string;
}
