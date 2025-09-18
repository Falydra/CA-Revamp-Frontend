import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DoneeLayout from "@/Layout/AuthenticatedLayout";
import { apiService } from "@/services/api";
import type { User, Campaign } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";

function formatPrice(value: number): string {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export default function DoneeDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalFundsRaised: 0,
    pendingCampaigns: 0,
  });

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);

        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }

       

        const campaignResponse = await apiService.getCampaigns({});

        const campaignList = Array.isArray(campaignResponse?.data?.data)
          ? campaignResponse.data.data
          : Array.isArray(campaignResponse?.data)
          ? campaignResponse.data
          : [];

        setCampaigns(campaignList);

        const totalCampaigns = campaignList.length;
        const activeCampaigns = campaignList.filter(
          (c: Campaign) => c.attributes?.status === "on_progress"
        ).length;
        const pendingCampaigns = campaignList.filter(
          (c: Campaign) => c.attributes?.status === "pending"
        ).length;
        const totalFundsRaised = campaignList.reduce(
          (sum: number, campaign: Campaign) => {
            return sum + (campaign.attributes?.donated_fund_amount || 0);
          },
          0
        );

        setStats({
          totalCampaigns,
          activeCampaigns,
          totalFundsRaised,
          pendingCampaigns,
        });
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

  if (loading) {
    return (
      <DoneeLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg">Loading dashboard...</div>
        </div>
      </DoneeLayout>
    );
  }

  return (
    <DoneeLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6 rounded-lg">
          <h1 className="text-2xl font-bold">
            Welcome, {user?.name || "Initiator"}!
          </h1>
          <p className="text-green-100 mt-2">
            Manage your donation campaigns and make an impact
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Campaigns
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCampaigns}</div>
              <p className="text-xs text-muted-foreground">
                Your campaigns created
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Campaigns
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeCampaigns}</div>
              <p className="text-xs text-muted-foreground">Currently running</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Approval
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingCampaigns}</div>
              <p className="text-xs text-muted-foreground">Awaiting review</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Funds Raised
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                Rp {formatPrice(stats.totalFundsRaised)}
              </div>
              <p className="text-xs text-muted-foreground">
                Total amount raised
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link to="/dashboard/donee/donations/create">
                <Button className="w-full h-16 text-left flex-col items-start justify-center">
                  <span className="font-semibold">Create New Campaign</span>
                  <span className="text-xs opacity-80">
                    Start a new donation campaign
                  </span>
                </Button>
              </Link>

              <Link to="/dashboard/donee/donations">
                <Button
                  variant="outline"
                  className="w-full h-16 text-left flex-col items-start justify-center"
                >
                  <span className="font-semibold">Manage Campaigns</span>
                  <span className="text-xs opacity-80">
                    View and edit your campaigns
                  </span>
                </Button>
              </Link>

              <Link to="/dashboard/donee/profile">
                <Button
                  variant="outline"
                  className="w-full h-16 text-left flex-col items-start justify-center"
                >
                  <span className="font-semibold">Profile Settings</span>
                  <span className="text-xs opacity-80">
                    Update your profile
                  </span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Recent Campaigns */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Your Recent Campaigns</CardTitle>
            <Link to="/dashboard/donee/donations">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {campaigns.length > 0 ? (
              <div className="space-y-4">
                {campaigns.slice(0, 5).map((campaign) => {
                  const campaignData = campaign.attributes || campaign;
                  const progress =
                    campaignData.requested_fund_amount > 0
                      ? Math.round(
                          (campaignData.donated_fund_amount /
                            campaignData.requested_fund_amount) *
                            100
                        )
                      : 0;

                  return (
                    <div
                      key={campaign.id}
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
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {campaignData.description || "No description"}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge
                              className={getStatusColor(
                                campaignData.status || "pending"
                              )}
                            >
                              {campaignData.status || "pending"}
                            </Badge>
                            {campaign.type === "fundraiser" && (
                              <span className="text-xs text-muted-foreground">
                                {progress}% funded
                              </span>
                            )}
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
                        <Link
                          to={`/campaigns/${campaignData.slug || campaign.id}`}
                        >
                          <Button variant="ghost" size="sm" className="mt-2">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No campaigns yet</p>
                <Link to="/dashboard/donee/donations/create">
                  <Button>Create Your First Campaign</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DoneeLayout>
  );
}
