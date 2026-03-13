export const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1.0";

const CLOUDINARY_CLOUD_NAME = "dcr9ovybu";

export const API_ENDPOINTS = {
  REGISTER: "/register",
  UPLOAD_IMAGE: `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`
};
