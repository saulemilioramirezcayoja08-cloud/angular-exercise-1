export interface LoginResponse {
  success: boolean;
  message: string;
  data: LoginData | null;
}

export interface LoginData {
  userId: number;
  username: string;
  email: string;
  name: string;
  roles: string[];
}
