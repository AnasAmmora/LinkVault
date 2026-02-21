import { http } from "./http";
import type { CategoryResponse } from "./types";

export const categoriesApi = {
  list: () => http.get<CategoryResponse[]>("/api/categories").then((r) => r.data),
  create: (name: string) => http.post<CategoryResponse>("/api/categories", { name }).then((r) => r.data),
  update: (id: number, name: string) => http.put<void>(`/api/categories/${id}`, { name }).then((r) => r.data),
  remove: (id: number) => http.delete<void>(`/api/categories/${id}`).then((r) => r.data),
};
