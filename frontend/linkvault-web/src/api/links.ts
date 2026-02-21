import { http } from "./http";
import type { LinkResponse, PagedResult } from "./types";

export const linksApi = {
  listByCollection: (collectionId: number, params?: { q?: string; categoryId?: number; sort?: string; page?: number; pageSize?: number }) =>
    http.get<PagedResult<LinkResponse>>(`/api/collections/${collectionId}/links`, { params }).then((r) => r.data),

  create: (collectionId: number, data: { url: string; title?: string; description?: string; categoryId?: number | null }) =>
    http.post<LinkResponse>(`/api/collections/${collectionId}/links`, data).then((r) => r.data),

  update: (id: number, data: { url: string; title?: string | null; description?: string | null; categoryId?: number | null }) =>
    http.put<void>(`/api/links/${id}`, data).then((r) => r.data),

  remove: (id: number) => http.delete<void>(`/api/links/${id}`).then((r) => r.data),

  move: (id: number, targetCollectionId: number) =>
    http.patch<void>(`/api/links/${id}/move`, { targetCollectionId }).then((r) => r.data),
};
