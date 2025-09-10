// // src/components/AuthProvider.tsx
// import React, { useState, useEffect } from "react";
// import { AuthContext } from "../contexts/AuthContext";
// import { apiService } from "../services/api";

// export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [user, setUser] = useState<{ name: string; email: string } | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     // On mount, try to fetch the user
//     apiService
//       .getUser()
//       .then((res: any) => {
//         setUser(res.data.user);
//         setIsAuthenticated(true);
//       })
//       .catch(() => {
//         setUser(null);
//         setIsAuthenticated(false);
//       })
//       .finally(() => setLoading(false));
//   }, []);

//   const login = async (data: { email: string; password: string }) => {
//     await apiService.login(data);
//     const res: any = await apiService.getUser();
//     setUser(res.data.user);
//     setIsAuthenticated(true);
//   };

//   const register = async (data: {
//     username: string;
//     email: string;
//     password: string;
//     password_confirmation: string;
//   }) => {
//     await apiService.register(data);
//     const res: any = await apiService.getUser();
//     setUser(res.data.user);
//     setIsAuthenticated(true);
//   };

//   const logout = async () => {
//     await apiService.logout();
//     setUser(null);
//     setIsAuthenticated(false);
//   };

//   return (
//     <AuthContext.Provider
//       value={{ isAuthenticated, user, login, register, logout, loading }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };
