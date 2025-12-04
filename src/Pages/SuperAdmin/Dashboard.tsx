import { Card, CardHeader, CardTitle, CardContent } from "@/Components/ui/card";
import Authenticated from "@/Layout/AuthenticatedLayout";
import { Users, Heart, Clock, CheckCircle, TrendingUp, AlertTriangle, Shield, Loader2 } from "lucide-react";
import { apiService } from "@/services/api";
import { useEffect, useState } from "react";
import type { User } from "@/types";
import { FaUser } from "react-icons/fa";

interface DashboardStats {
  totalUsers: number;
  totalAdmins: number;
  totalCampaigns: number;
  pendingCampaigns: number;
  activeCampaigns: number;
  totalFundsRaised: number;
  pendingApplications: number;
}

export default function SuperAdminDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalAdmins: 0,
    totalCampaigns: 0,
    pendingCampaigns: 0,
    activeCampaigns: 0,
    totalFundsRaised: 0,
    pendingApplications: 0,
  });

  useEffect(() => {
    fetchDashboardStats();
    const storedUser = localStorage.getItem("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await apiService.superAdmin.getDashboardStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID").format(price);
  };

  return (
    <Authenticated>
      <div className="space-y-6 p-4 w-full">
         <div className="bg-primary-bg text-white p-6 rounded-lg">
          <h1 className="text-2xl font-bold">
            Welcome, {user?.name || "Superadmin"}!
          </h1>
          <p className="text-blue-100 mt-2">
            Manage all donation activities
          </p>
        </div>


        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /> : stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">Registered users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Admins</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /> : stats.totalAdmins}</div>
              <p className="text-xs text-muted-foreground">Platform administrators</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Campaigns
              </CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /> : stats.totalCampaigns}</div>
              <p className="text-xs text-muted-foreground">All campaigns</p>
            </CardContent>
          </Card>

          

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Campaigns
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /> : stats.activeCampaigns}</div>
              <p className="text-xs text-muted-foreground">Currently running</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Authenticated>
  );
}
