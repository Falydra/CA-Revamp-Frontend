import api from "@/services/api";

export const login = async (email: string, password: string) => {
  const response = await api.post("/login", { email, password });
  
  const { token, user } = response.data.data;
  
  localStorage.setItem("auth_token", token);

  return user;
};
