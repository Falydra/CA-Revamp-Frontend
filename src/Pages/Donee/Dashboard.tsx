import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DoneeLayout from "@/Layout/AuthenticatedLayout";
import { apiService } from "@/services/api";
import type { User, Campaign } from "@/types";
import { Card, CardContent,  CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { FaSpinner } from "react-icons/fa";
import { Loader2 } from "lucide-react";

function formatPrice(value: number): string {
  if (value == 0) {
    return "0";
  }
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

       

        // Fetch organizer-owned campaigns so pending/rejected items are included
        const campaignResponse = await apiService.getOrganizerCampaigns({ page: 1, per_page: 10 });

        // apiService.getOrganizerCampaigns returns axios response.data where
        // the paginated resource array is available as `.data`.
        // Normalize the result to an array of campaign objects.
        let campaignList: any[] = [];
        if (Array.isArray(campaignResponse?.data)) {
          campaignList = campaignResponse.data;
        } else if (Array.isArray(campaignResponse?.data?.data)) {
          campaignList = campaignResponse.data.data;
        } else if (Array.isArray(campaignResponse)) {
          campaignList = campaignResponse;
        }

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
            const numericAmount = parseInt(String(campaign.attributes?.donated_fund_amount), 10);
            return sum + (numericAmount || 0);
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
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DoneeLayout>
    );
  }

  return (
    <DoneeLayout>
      <div className="space-y-6 p-4 w-full">
        <div className="bg-primary-bg text-white p-6 rounded-lg">
          <h1 className="text-2xl font-bold">
            Welcome, {user?.name || "Initiator"}!
          </h1>
          <p className="text-green-100 mt-2">
            Manage your donation campaigns and make an impact
          </p>
        </div>

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

        

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Your Recent Campaigns</CardTitle>
            <Link to="/dashboard/organizer/donations">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {campaigns.length > 0 ? (
              <div className="space-y-4">
                {[...campaigns]
                  .sort((a, b) => {
                    // Get created_at from attributes
                    const dateStrA = a.attributes?.created_at || a.created_at;
                    const dateStrB = b.attributes?.created_at || b.created_at;
                    
                    // Parse dates - handle both ISO format and custom format (DD-MM-YYYY HH:mm:ss)
                    let dateA: Date;
                    let dateB: Date;
                    
                    if (dateStrA && typeof dateStrA === 'string' && dateStrA.includes('-') && dateStrA.split('-')[0].length === 2) {
                      // Format: DD-MM-YYYY HH:mm:ss
                      const [datePart, timePart] = dateStrA.split(' ');
                      const [day, month, year] = datePart.split('-');
                      dateA = new Date(`${year}-${month}-${day}${timePart ? ' ' + timePart : ''}`);
                    } else {
                      dateA = new Date(dateStrA || 0);
                    }
                    
                    if (dateStrB && typeof dateStrB === 'string' && dateStrB.includes('-') && dateStrB.split('-')[0].length === 2) {
                      // Format: DD-MM-YYYY HH:mm:ss
                      const [datePart, timePart] = dateStrB.split(' ');
                      const [day, month, year] = datePart.split('-');
                      dateB = new Date(`${year}-${month}-${day}${timePart ? ' ' + timePart : ''}`);
                    } else {
                      dateB = new Date(dateStrB || 0);
                    }
                    
                    // Sort descending (newest first)
                    return dateB.getTime() - dateA.getTime();
                  })
                  .slice(0, 2)
                  .map((campaign) => {
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
                            campaignData.header_image_url || "/images/Charity1.jpeg"
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
                        <p className="font-bold">
                          {campaignData.requested_fund_amount > 0 ? "Rp." + formatPrice(campaignData.donated_fund_amount) + "/" + formatPrice(campaignData.requested_fund_amount)
                           : campaignData.donated_item_quantity + "/" + campaignData.requested_item_quantity + " " + "Items"}
                        </p>
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
