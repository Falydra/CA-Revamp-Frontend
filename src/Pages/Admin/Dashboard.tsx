import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "@/Layout/AuthenticatedLayout";
import { apiService } from "@/services/api";
import type { User, Campaign } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import {
  Users,
  Heart,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";

function formatPrice(value: number): string {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export default function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCampaigns: 0,
    pendingCampaigns: 0,
    activeCampaigns: 0,
    totalFundsRaised: 0,
    pendingApplications: 0,
  });
  const [recentCampaigns, setRecentCampaigns] = useState<Campaign[]>([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);

        
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }

        
        try {
          const statsResponse = await apiService.admin.getDashboardStats();
          if (statsResponse.success) {
            setStats(statsResponse.data);
          }
        } catch (error) {
          console.log("Dashboard stats not available, using fallback");
        }

      
        const campaignResponse = await apiService.getCampaigns();
        const campaignList = Array.isArray(campaignResponse?.data?.data)
          ? campaignResponse.data.data
          : Array.isArray(campaignResponse?.data)
          ? campaignResponse.data
          : [];

        setRecentCampaigns(campaignList.slice(0, 5));

        
        if (stats.totalCampaigns === 0) {
          const totalCampaigns = campaignList.length;
          const pendingCampaigns = campaignList.filter(
            (c: Campaign) => c.attributes?.status === "pending"
          ).length;
          const activeCampaigns = campaignList.filter(
            (c: Campaign) => c.attributes?.status === "on_progress"
          ).length;
          const totalFundsRaised = campaignList.reduce(
            (sum: number, campaign: Campaign) => {
              return sum + (campaign.attributes?.donated_fund_amount || 0);
            },
            0
          );

          setStats((prev) => ({
            ...prev,
            totalCampaigns,
            pendingCampaigns,
            activeCampaigns,
            totalFundsRaised,
          }));
        }
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "on_progress":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "finished":
        return "bg-blue-100 text-blue-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "on_progress":
        return <CheckCircle className="w-4 h-4" />;
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "finished":
        return <CheckCircle className="w-4 h-4" />;
      case "rejected":
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg">Loading dashboard...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg">
          <h1 className="text-2xl font-bold">
            Welcome, {user?.name || "Admin"}!
          </h1>
          <p className="text-blue-100 mt-2">
            Manage the platform and oversee all donation activities
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">Registered users</p>
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
              <div className="text-2xl font-bold">{stats.totalCampaigns}</div>
              <p className="text-xs text-muted-foreground">All campaigns</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Review
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingCampaigns}</div>
              <p className="text-xs text-muted-foreground">Awaiting approval</p>
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
              <div className="text-2xl font-bold">{stats.activeCampaigns}</div>
              <p className="text-xs text-muted-foreground">Currently running</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Funds Raised
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                Rp {formatPrice(stats.totalFundsRaised)}
              </div>
              <p className="text-xs text-muted-foreground">
                Total platform funds
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Applications
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.pendingApplications}
              </div>
              <p className="text-xs text-muted-foreground">
                Pending organizer apps
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link to="/dashboard/admin/manage-users">
                <Button className="w-full h-16 text-left flex-col items-start justify-center">
                  <span className="font-semibold">Manage Users</span>
                  <span className="text-xs opacity-80">
                    View and edit users
                  </span>
                </Button>
              </Link>

              <Link to="/dashboard/admin/manage-donations">
                <Button
                  variant="outline"
                  className="w-full h-16 text-left flex-col items-start justify-center"
                >
                  <span className="font-semibold">Manage Campaigns</span>
                  <span className="text-xs opacity-80">Review and approve</span>
                </Button>
              </Link>

              <Link to="/dashboard/admin/manage-application">
                <Button
                  variant="outline"
                  className="w-full h-16 text-left flex-col items-start justify-center"
                >
                  <span className="font-semibold">Applications</span>
                  <span className="text-xs opacity-80">
                    Organizer applications
                  </span>
                </Button>
              </Link>

              <Link to="/dashboard/admin/profile">
                <Button
                  variant="outline"
                  className="w-full h-16 text-left flex-col items-start justify-center"
                >
                  <span className="font-semibold">Profile</span>
                  <span className="text-xs opacity-80">Account settings</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Campaigns</CardTitle>
            <Link to="/dashboard/admin/manage-donations">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentCampaigns.length > 0 ? (
              <div className="space-y-4">
                {recentCampaigns.map((campaign) => {
                  const campaignData = campaign.attributes || campaign;
                  const organizerName =
                    campaign.relationships?.organizer?.attriutes?.name ||
                    campaign.relationships?.organizer?.name ||
                    "Anonymous";

                  return (
                    <div
                      key={campaign.campaign_id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={
                            campaignData.header_image_url
                              ? campaignData.header_image_url.startsWith(
                                  "/storage/"
                                )
                                ? `http://localhost:8000${campaignData.header_image_url}`
                                : `http://localhost:8000/storage/${campaignData.header_image_url}`
                              : "/images/Charity1.jpeg"
                          }
                          alt={campaignData.title || "Campaign"}
                          className="w-16 h-16 object-cover rounded-md"
                          onError={(e) => {
                            e.currentTarget.src = "/images/Charity1.jpeg";
                          }}
                        />
                        <div>
                          <h3 className="font-medium line-clamp-1">
                            {campaignData.title || "Untitled Campaign"}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            by {organizerName}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge
                              className={getStatusColor(
                                campaignData.status || "pending"
                              )}
                            >
                              <div className="flex items-center gap-1">
                                {getStatusIcon(
                                  campaignData.status || "pending"
                                )}
                                {campaignData.status || "pending"}
                              </div>
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(
                                campaignData.created_at || Date.now()
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        {campaign.type === "fundraiser" ? (
                          <>
                            <p className="font-bold">
                              Rp{" "}
                              {formatPrice(
                                campaignData.donated_fund_amount || 0
                              )}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              / Rp{" "}
                              {formatPrice(
                                campaignData.requested_fund_amount || 0
                              )}
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="font-bold">
                              {campaignData.donated_item_quantity || 0} items
                            </p>
                            <p className="text-sm text-muted-foreground">
                              / {campaignData.requested_item_quantity || 0}{" "}
                              needed
                            </p>
                          </>
                        )}
                        <div className="flex gap-1 mt-2">
                          <Link
                            to={`/campaigns/${
                              campaignData.slug || campaign.campaign_id
                            }`}
                          >
                            <Button variant="ghost" size="sm">
                              View
                            </Button>
                          </Link>
                          {campaignData.status === "pending" && (
                            <Link to={`/dashboard/admin/manage-donations`}>
                              <Button variant="outline" size="sm">
                                Review
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No campaigns found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
