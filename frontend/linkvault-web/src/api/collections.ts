import { http } from "./http";
import type { CollectionResponse, PagedResult } from "./types";

export const collectionsApi = {
  list: (params?: { q?: string; sort?: string; page?: number; pageSize?: number }) =>
    http.get<PagedResult<CollectionResponse>>("/api/collections", { params }).then((r) => r.data),

  create: (name: string) =>
    http.post<CollectionResponse>("/api/collections", { name }).then((r) => r.data),

  update: (id: number, name: string) =>
    http.put<void>(`/api/collections/${id}`, { name }).then((r) => r.data),

  remove: (id: number) =>
    http.delete<void>(`/api/collections/${id}`).then((r) => r.data),
};
