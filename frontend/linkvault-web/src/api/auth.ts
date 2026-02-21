import { http } from "./http";
import type { AuthResponse, LoginRequest, RegisterRequest, MeResponse } from "./types";

export const authApi = {
  register: (data: RegisterRequest) =>
    http.post<AuthResponse>("/api/auth/register", data).then((r) => r.data),

  login: (data: LoginRequest) =>
    http.post<AuthResponse>("/api/auth/login", data).then((r) => r.data),

  me: () => http.get<MeResponse>("/api/auth/me").then((r) => r.data),
};
