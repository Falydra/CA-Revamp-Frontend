import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api/v1",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const apiService = {
  register: async (userData: {
    username: string;
    email: string;
    password: string;
    password_confirmation: string;
  }) => {
    try {
      console.log("Getting CSRF cookie...");
      await axios.get("http://localhost:8000/api/v1/sanctum/csrf-cookie", {
        withCredentials: true,
      });
      console.log("CSRF cookie obtained successfully");

      const csrfToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("XSRF-TOKEN="))
        ?.split("=")[1];

      console.log("Attempting registration...");
      const response = await axios.post(
        "http://localhost:8000/api/v1/register",
        userData,
        {
          withCredentials: true,
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "X-XSRF-TOKEN": csrfToken ? decodeURIComponent(csrfToken) : "",
          },
        }
      );
      console.log("Registration response:", response.data);

      return response.data;
    } catch (error) {
      console.error("API Service Registration Error:", error);
      throw error;
    }
  },

  login: async ({ email, password }: { email: string; password: string }) => {
    try {
      await axios.get("http://localhost:8000/api/v1/sanctum/csrf-cookie", {
        withCredentials: true,
      });

      const csrfToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("XSRF-TOKEN="))
        ?.split("=")[1];

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
    console.log(api.getUri());
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

    getCampaigns: async (params: { type?: string; search?: string }) => {
    try {
      const response = await api.get("/campaigns", {
        params: {
          type: params.type || "",
          search: params.search || "",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Get campaigns error:", error);
      throw error;
    }
  },

    // Organizer-specific campaigns (includes pending/rejected for that organizer)
    getOrganizerCampaigns: async (params: { page?: number; per_page?: number; type?: string; status?: string; search?: string } = {}) => {
      try {
        const response = await api.get('/organizer/campaigns', {
          params: {
            page: params.page || 1,
            per_page: params.per_page || 10,
            type: params.type || undefined,
            status: params.status || undefined,
            search: params.search || undefined,
          }
        });
        return response.data;
      } catch (error) {
        console.error('Get organizer campaigns error:', error);
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

  createCampaign: async (campaignData: FormData) => {
    try {
      // Ensure Sanctum CSRF cookie is present for session-based requests
      await axios.get("http://localhost:8000/api/v1/sanctum/csrf-cookie", {
        withCredentials: true,
      });

      // Read XSRF token from cookie and attach as header
      const csrfToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("XSRF-TOKEN="))
        ?.split("=")[1];

      const headers: Record<string, string> = {};
      if (csrfToken) headers["X-XSRF-TOKEN"] = decodeURIComponent(csrfToken);

      // Do not manually set Content-Type for FormData - let the browser set boundary
      const response = await api.post("/campaigns", campaignData, {
        headers,
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      // Log detailed server response when available to help debugging validation errors
      if (axios.isAxiosError(error) && error.response) {
        console.error("Create campaign error response:", error.response.data);
      } else {
        console.error("Create campaign error:", error);
      }
      throw error;
    }
  },

  updateCampaign: async (id: string, campaignData: FormData) => {
    try {
      const response = await api.put(`/campaigns/${id}`, campaignData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Update campaign error:", error);
      throw error;
    }
  },

  deleteCampaign: async (id: string) => {
    try {
      const response = await api.delete(`/campaigns/${id}`);
      return response.data;
    } catch (error) {
      console.error("Delete campaign error:", error);
      throw error;
    }
  },

  getFunds: async (campaignId: string, params: { status?: string; }) => {
    try {
      const url = `/campaigns/${campaignId}/funds`;
      const response = await api.get(url, {
        params: {
          status: params.status || ""
        }
      });
      return response.data;
    } catch (error) {
      console.error("Get funds error:", error);
      throw error;
    }
  },

  createFund: async (fundData: any) => {
    try {
      const response = await api.post("/funds", fundData);
      return response.data;
    } catch (error) {
      console.error("Create fund error:", error);
      throw error;
    }
  },

  getDonatedBooks: async (campaignId?: string) => {
    try {
      const url = campaignId
        ? `/donated-books?campaign_id=${campaignId}`
        : "/donated-books";
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error("Get donated books error:", error);
      throw error;
    }
  },

  createDonatedBook: async (bookData: any) => {
    try {
      const response = await api.post("/donated-books", bookData);
      return response.data;
    } catch (error) {
      console.error("Create donated book error:", error);
      throw error;
    }
  },

  getDonatedItems: async (campaignId?: string) => {
    try {
      const url = campaignId
        ? `/donated-items?campaign_id=${campaignId}`
        : "/donated-items";
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error("Get donated items error:", error);
      throw error;
    }
  },

  createDonatedItem: async (itemData: any) => {
    try {
      const response = await api.post("/donated-items", itemData);
      return response.data;
    } catch (error) {
      console.error("Create donated item error:", error);
      throw error;
    }
  },

  getBooks: async () => {
    try {
      const response = await api.get("/books");
      return response.data;
    } catch (error) {
      console.error("Get books error:", error);
      throw error;
    }
  },

  getBook: async (isbn: string) => {
    try {
      const response = await api.get(`/books/${isbn}`);
      return response.data;
    } catch (error) {
      console.error("Get book error:", error);
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

  updateOrganizerApplicationStatus: async (
      applicationId: string,
      status: string,
      message?: string
    ) => {
      try {
        const response = await api.put("/organizer-applications", {
          id: applicationId,
          status: status,
          message: message,
        });
        return response.data;
      } catch (error) {
        console.error("Update organizer application status error:", error);
        throw error;
      }
    },

    getOrganizerApplications: async (page = 1, per_page = 10, status?: string) => {
      try {
        const response = await api.get("/organizer-applications", {
          params: { page, per_page, status },
        });
        return response.data;
      } catch (error) {
        console.error("Get organizer applications error:", error);
        throw error;
      }
    },

  approveOrganizerApplication: async (id: string) => {
    const url = "http://localhost:8000/api/v1/sanctum/csrf-cookie";
    try {
      // Ensure Sanctum CSRF cookie is present
      await axios.get(url, { withCredentials: true });

      const csrfToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("XSRF-TOKEN="))
        ?.split("=")[1];

      const headers: Record<string, string> = {};
      if (csrfToken) headers["X-XSRF-TOKEN"] = decodeURIComponent(csrfToken);

      const response = await api.post(
        `/admin/applications/review`,
        { id, status: "accepted" },
        { headers, withCredentials: true }
      );
      return response.data;
    } catch (error: any) {
      console.error("Approve organizer application error:", error);
      // If 419 (CSRF), try once more after fetching csrf cookie
      if (error?.response?.status === 419) {
        try {
          await axios.get(url, { withCredentials: true });
          const csrfToken = document.cookie
            .split("; ")
            .find((row) => row.startsWith("XSRF-TOKEN="))
            ?.split("=")[1];
          const headers: Record<string, string> = {};
          if (csrfToken) headers["X-XSRF-TOKEN"] = decodeURIComponent(csrfToken);
          const retry = await api.post(
            `/admin/applications/review`,
            { id, status: "accepted" },
            { headers, withCredentials: true }
          );
          return retry.data;
        } catch (err) {
          console.error("Retry approve failed:", err);
          throw err;
        }
      }
      throw error;
    }
  },

  rejectOrganizerApplication: async (id: string, reason?: string) => {
    const url = "http://localhost:8000/api/v1/sanctum/csrf-cookie";
    try {
      await axios.get(url, { withCredentials: true });

      const csrfToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("XSRF-TOKEN="))
        ?.split("=")[1];

      const headers: Record<string, string> = {};
      if (csrfToken) headers["X-XSRF-TOKEN"] = decodeURIComponent(csrfToken);

      const response = await api.post(
        `/admin/applications/review`,
        { id, status: "rejected", message: reason || null },
        { headers, withCredentials: true }
      );
      return response.data;
    } catch (error: any) {
      console.error("Reject organizer application error:", error);
      if (error?.response?.status === 419) {
        try {
          await axios.get(url, { withCredentials: true });
          const csrfToken = document.cookie
            .split("; ")
            .find((row) => row.startsWith("XSRF-TOKEN="))
            ?.split("=")[1];
          const headers: Record<string, string> = {};
          if (csrfToken) headers["X-XSRF-TOKEN"] = decodeURIComponent(csrfToken);
          const retry = await api.post(
            `/admin/applications/review`,
            { id, status: "rejected", message: reason || null },
            { headers, withCredentials: true }
          );
          return retry.data;
        } catch (err) {
          console.error("Retry reject failed:", err);
          throw err;
        }
      }
      throw error;
    }
  },

  getRequestedSupplies: (campaignId: string) =>
    api.get(`/campaigns/${campaignId}/requested-supplies`),

  getRequestedBooks: (campaignId: string) =>
    api.get(`/campaigns/${campaignId}/requested-books`),

  createDonation: async (campaignId: string, donationData: FormData) => {
    try {
      // Ensure Sanctum CSRF cookie is present for session-based requests
      await axios.get("http://localhost:8000/api/v1/sanctum/csrf-cookie", {
        withCredentials: true,
      });

      // Read XSRF token from cookie and attach as header
      const csrfToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("XSRF-TOKEN="))
        ?.split("=")[1];

      const headers: Record<string, string> = {};
      if (csrfToken) {
        headers["X-XSRF-TOKEN"] = decodeURIComponent(csrfToken);
      }

      // Do not manually set Content-Type for FormData - let the browser set boundary
      const response = await api.post(
        `/campaigns/${campaignId}/donations`,
        donationData,
        {
          headers,
          withCredentials: true,
        }
      );

      return response.data;
    } catch (error) {
      console.error("Create Donation Error: ", error);
      throw error;
    }
  },

  getFundsCampaignHistory: async (campaignId: string, params: { status?: string; }) => {
    try {
      const url = `/campaigns/${campaignId}/funds`;
      const response = await api.get(url, {
        params: {
          status: params.status || ""
        }
      });
      return response.data;
    } catch (error) {
      console.error("Get funds error:", error);
      throw error;
    }
  },

  getItemsCampaignHistory: async (campaignId: string, params: { status?: string; }) => {
    try {
      const url = `/campaigns/${campaignId}/items`;
      const response = await api.get(url, {
        params: {
          status: params.status || ""
        }
      });
      return response.data;
    } catch (error) {
      console.error("Get funds error:", error);
      throw error;
    }
  },

  getIdentity: async () => {
    const response = await api.get('/identity');
    return response.data;
  },

  createIdentity: async (data: FormData) => {
    try {
      // Get CSRF cookie
      await axios.get("http://localhost:8000/api/v1/sanctum/csrf-cookie", {
        withCredentials: true,
      });

      // Get CSRF token
      const csrfToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("XSRF-TOKEN="))
        ?.split("=")[1];

      const headers: Record<string, string> = {};
      if (csrfToken) {
        headers["X-XSRF-TOKEN"] = decodeURIComponent(csrfToken);
      }

      const response = await api.post('/identity', data, {
        headers,
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.error("Create Identity Error: ", error);
      throw error;
    }
  },

  updateIdentity: async (data: FormData) => {
    try {
      // Get CSRF cookie
      await axios.get("http://localhost:8000/api/v1/sanctum/csrf-cookie", {
        withCredentials: true,
      });

      // Get CSRF token
      const csrfToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("XSRF-TOKEN="))
        ?.split("=")[1];

      const headers: Record<string, string> = {};
      if (csrfToken) {
        headers["X-XSRF-TOKEN"] = decodeURIComponent(csrfToken);
      }

      const response = await api.put('/identity', data, {
        headers,
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.error("Update Identity Error: ", error);
      throw error;
    }
  },

  getOrganizerApplication: async () => {
    try {
      const response = await api.get('/application');
      return response.data;
    } catch (error) {
      console.error("Get Organizer Application Error: ", error);
      throw error;
    }
  },

  createOrganizerApplication: async () => {
    try {
      // Get CSRF cookie
      await axios.get("http://localhost:8000/api/v1/sanctum/csrf-cookie", {
        withCredentials: true,
      });

      // Get CSRF token
      const csrfToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("XSRF-TOKEN="))
        ?.split("=")[1];

      const headers: Record<string, string> = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      };
      if (csrfToken) {
        headers["X-XSRF-TOKEN"] = decodeURIComponent(csrfToken);
      }

      const response = await api.post('/application', {}, {
        headers,
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.error("Create Organizer Application Error: ", error);
      throw error;
    }
  },

  reapplyOrganizerApplication: async () => {
    try {
      // Get CSRF cookie
      await axios.get("http://localhost:8000/api/v1/sanctum/csrf-cookie", {
        withCredentials: true,
      });

      // Get CSRF token
      const csrfToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("XSRF-TOKEN="))
        ?.split("=")[1];

      const headers: Record<string, string> = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      };
      if (csrfToken) {
        headers["X-XSRF-TOKEN"] = decodeURIComponent(csrfToken);
      }

      const response = await api.post('/application/reapply', {}, {
        headers,
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.error("Reapply Organizer Application Error: ", error);
      throw error;
    }
  },



  admin: {
    getUsers: async (page = 1, per_page = 10) => {
      try {
        const response = await api.get("/admin/users", {
          params: { page, per_page },
        });
        return response.data;
      } catch (error) {
        console.error("Get users error:", error);
        throw error;
      }
    },

    updateUser: async (userId: string, userData: any) => {
      try {
        const response = await api.put(`/admin/users/${userId}`, userData);
        return response.data;
      } catch (error) {
        console.error("Update user error:", error);
        throw error;
      }
    },

    deleteUser: async (userId: string) => {
      try {
        const response = await api.delete(`/admin/users/${userId}`);
        return response.data;
      } catch (error) {
        console.error("Delete user error:", error);
        throw error;
      }
    },

    updateCampaignStatus: async (
      campaignId: string,
      status: string
    ) => {
      try {
        // Ensure Sanctum CSRF cookie is present for stateful admin actions
        await axios.get("http://localhost:8000/api/v1/sanctum/csrf-cookie", {
          withCredentials: true,
        });

        const csrfToken = document.cookie
          .split("; ")
          .find((row) => row.startsWith("XSRF-TOKEN="))
          ?.split("=")[1];

        const headers: Record<string, string> = {};
        if (csrfToken) headers["X-XSRF-TOKEN"] = decodeURIComponent(csrfToken);

        // The backend expects a review action with _action='review' and status 'accepted' or 'rejected'
        const payload: any = { _action: "review", status };

        // Use identifier-based admin review endpoint that accepts campaign_id or slug
        const response = await api.put(`/admin/campaigns/by-identifier/${campaignId}`, payload, {
          headers,
          withCredentials: true,
        });

        return response.data;
      } catch (error) {
        console.error("Update campaign status error:", error);
        throw error;
      }
    },

    deleteCampaign: async (campaignId: string) => {
      try {
        const response = await api.delete(`/admin/campaigns/${campaignId}`);
        return response.data;
      } catch (error) {
        console.error("Delete campaign error:", error);
        throw error;
      }
    },

    getOrganizerApplications: async (page = 1, per_page = 10) => {
      try {
        const response = await api.get("/admin/applications", {
          params: { page, per_page },
        });
        return response.data;
      } catch (error) {
        console.error("Get organizer applications error:", error);
        throw error;
      }
    },

    updateApplicationStatus: async (
      applicationId: string,
      status: string,
      notes?: string
    ) => {
      try {
        const response = await api.put(
          `/admin/organizer-applications/${applicationId}`,
          {
            status,
            notes,
          }
        );
        return response.data;
      } catch (error) {
        console.error("Update application status error:", error);
        throw error;
      }
    },

    getDashboardStats: async () => {
      try {
        const response = await api.get("/admin/dashboard-stats");
        return response.data;
      } catch (error) {
        console.error("Get dashboard stats error:", error);
        throw error;
      }
    },

    getDonations: async (page = 1, per_page = 10) => {
      try {
        const response = await api.get("/admin/donations", {
          params: { page, per_page },
        });
        return response.data;
      } catch (error) {
        console.error("Get donations error:", error);
        throw error;
      }
    },
    getCampaigns: async (params: { page?: number; per_page?: number; type?: string; status?: string; search?: string } = {}) => {
      try {
        const response = await api.get('/admin/campaigns', {
          params: {
            page: params.page || 1,
            per_page: params.per_page || 10,
            type: params.type || undefined,
            status: params.status || undefined,
            search: params.search || undefined,
          }
        });
        return response.data;
      } catch (error) {
        console.error('Get admin campaigns error:', error);
        throw error;
      }
    },

    updateDonationStatus: async (donationId: string, status: string) => {
      try {
        const response = await api.put(
          `/admin/donations/${donationId}/status`,
          {
            status,
          }
        );
        return response.data;
      } catch (error) {
        console.error("Update donation status error:", error);
        throw error;
      }
    },
  },
};



export default api;