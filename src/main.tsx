import React, { Suspense, lazy } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Welcome from "@/Pages/Welcome";
import Login from "@/Pages/Auth/Login";
// import News from "@/Pages/News";
import Campaign from "@/Pages/Campaign";
const Dashboard = lazy(() => import("@/Pages/Donor/Dashboard"));

import "./index.css";
import { ErrorBoundary } from "@/Components/ErrorBoundary";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ErrorBoundary>
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/donation" element={<Campaign />} />
            <Route path="/dashboard/donor" element={<Dashboard />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  </React.StrictMode>
);
