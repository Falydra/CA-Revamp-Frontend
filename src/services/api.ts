import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api/v1",

  withCredentials: true,
});

export const apiService = {
  login: async ({ email, password }: { email: string; password: string }) => {
    try {
      
      console.log("Getting CSRF cookie...");
      await axios.get("http://localhost:8000/sanctum/csrf-cookie", {
        withCredentials: true,
      });
      console.log("CSRF cookie obtained successfully");

      const csrfToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("XSRF-TOKEN="))
        ?.split("=")[1];

      console.log("Attempting login...");
      const response = await axios.post(
        "http://localhost:8000/api/v1/login",
        {
          email,
          password,
        },
        {
          withCredentials: true,
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "X-XSRF-TOKEN": csrfToken ? decodeURIComponent(csrfToken) : "",
          },
        }
      );
      console.log("Login response:", response.data);

      return response.data;
    } catch (error) {
      console.error("API Service Login Error:", error);
      throw error;
    }
  },

  getCurrentUser: async () => {
    try {
      const response = await api.get("/user");
      return response.data;
    } catch (error) {
      console.error("Get current user error:", error);
      throw error;
    }
  },

  logout: async () => {
    const token = localStorage.getItem("auth_token");
    await api.post(
      "/logout",
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      }
    );
   
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
    localStorage.removeItem("roles");
  },

  getCampaigns: async () => {
    try {
      const response = await api.get("/campaigns");
      
      return response.data;
    } catch (error) {
      console.error("Get campaigns error:", error);
      throw error;
    }
  },

  getCampaign: async (id: string) => {
    try {
      const response = await api.get(`/campaigns/${id}`);
      console.log("Single campaign API response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Get campaign error:", error);
      throw error;
    }
  },

  getFunds: async (campaignId?: string) => {
    try {
      const url = campaignId ? `/funds?campaign_id=${campaignId}` : "/funds";
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error("Get funds error:", error);
      throw error;
    }
  },

  getDonatedBooks: async (campaignId?: string) => {
    try {
      const url = campaignId ? `/donated-books?campaign_id=${campaignId}` : "/donated-books";
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error("Get donated books error:", error);
      throw error;
    }
  },

  getDonatedItems: async (campaignId?: string) => {
    try {
      const url = campaignId ? `/donated-items?campaign_id=${campaignId}` : "/donated-items";
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error("Get donated items error:", error);
      throw error;
    }
  },

  getDonorDonations: async (page = 1, per_page = 5) => {
    const token = localStorage.getItem("auth_token");
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

   
    const endpoints = ["/donor/donations", "/donations/me", "/donations"];
    for (const ep of endpoints) {
      try {
        const res = await api.get(ep, {
          params: { page, per_page },
          headers,
          withCredentials: true,
        });
        return res.data;
      } catch (err: any) {
        const status = err?.response?.status;
        if (status === 401) throw err; 
        if (status === 404) continue;  
        throw err;
      }
    }

    return { data: [] };
  },
};

export default api;
