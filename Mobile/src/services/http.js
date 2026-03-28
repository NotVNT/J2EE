import axios from "axios";
import { BASE_URL } from "../constants/api";
import { tokenStorage } from "../storage/tokenStorage";

const publicEndpoints = ["/login", "/register", "/activate", "/forgot-password", "/health"];

const http = axios.create({
  baseURL: BASE_URL,
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json"
  }
});

http.interceptors.request.use(async (config) => {
  const shouldSkipToken = publicEndpoints.some((endpoint) => config.url?.includes(endpoint));
  if (shouldSkipToken) {
    return config;
  }

  const token = await tokenStorage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default http;
