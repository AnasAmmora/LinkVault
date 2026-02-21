export type AuthResponse = {
  id: number;
  name: string;
  email: string;
  token: string;
};

export type RegisterRequest = { name: string; email: string; password: string };
export type LoginRequest = { email: string; password: string };

export type MeResponse = { userId: string; email: string; name: string };

export type PagedResult<T> = {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  items: T[];
};

export type CollectionResponse = { id: number; name: string; createdAt: string };
export type CategoryResponse = { id: number; name: string; createdAt: string };

export type LinkResponse = {
  id: number;
  collectionId: number;
  categoryId: number | null;
  url: string;
  title: string | null;
  description: string | null;
  createdAt: string;
};
