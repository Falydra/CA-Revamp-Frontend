import React, { Suspense, lazy } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Welcome from "@/Pages/Welcome";
import Login from "@/Pages/Auth/Login";
import Campaign from "@/Pages/Campaign";
const Dashboard = lazy(() => import("@/Pages/Donor/Dashboard"));
const DonationHistory = lazy(() => import("@/Pages/Donor/DonationHistory"));
const DonorProfile = lazy(() => import("@/Pages/Donor/Profile"));

import CampaignDetail from '@/Pages/Donation/DonationDetail';
import DoneeRegister from "@/Pages/Donor/DoneeRegister";
import DoneeDashboard from "@/Pages/Donee/Dashboard";
import ActiveDonation from "@/Pages/Donee/ActiveDonation";
import DoneeProfile from "@/Pages/Donee/Profile";
import AdminDashboard from "@/Pages/Admin/Dashboard";
import ManageApplication from "@/Pages/Admin/ManageApplication";
import ManageDonations from "@/Pages/Admin/ManageDonations";
import ManageUsers from "@/Pages/Admin/ManageUsers";
import AdminProfile from "@/Pages/Admin/Profile";


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
            <Route path="/donation/:id" element={<CampaignDetail />} />
            <Route path="/campaigns" element={<Campaign />} />
            <Route path="/campaigns/:id" element={<CampaignDetail />} />
            <Route path="/dashboard/donor" element={<Dashboard />} />
            <Route path="/dashboard/donor/history" element={<DonationHistory />} />
            <Route path="/dashboard/donor/profile" element={<DonorProfile />} />
            <Route path="/dashboard/donor/profile/registration" element={<DoneeRegister />} />
             <Route path="/dashboard/donee" element={<DoneeDashboard />} />
            <Route path="/dashboard/donee/donations" element={<ActiveDonation />} />
            <Route path="/dashboard/donee/profile" element={<DoneeProfile />} />
            <Route path="/dashboard/admin" element={<AdminDashboard />} />
            <Route path="/dashboard/admin/manage-application" element={<ManageApplication />} />
            <Route path="/dashboard/admin/manage-donations" element={<ManageDonations />} />
            <Route path="/dashboard/admin/manage-users" element={<ManageUsers />} />
            <Route path="/dashboard/admin/profile" element={<AdminProfile />} />

            
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  </React.StrictMode>
);