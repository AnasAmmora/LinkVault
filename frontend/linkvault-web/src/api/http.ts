import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL;

export const http = axios.create({
  baseURL,
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem("lv_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
