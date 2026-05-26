export type UserRole = 'user' | 'admin';

export interface User {
  userId: number;
  userName: string;
  email: string;
  role: UserRole;
  profileIcon?: string | null;
}
