import axios from "axios";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});


axiosClient.interceptors.request.use(async (config) => {
  await axios.get(`${import.meta.env.VITE_BACKEND_URL}/sanctum/csrf-cookie`, {
    withCredentials: true,
  });
  return config;
});

export default axiosClient;
