import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import DoneeLayout from "@/Layout/AuthenticatedLayout";
import { apiService } from "@/services/api";
import type { Campaign } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { Input } from "@/Components/ui/input";

function formatPrice(value: number): string {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export default function ActiveDonation() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const navigate = useNavigate();

  const getCampaignStatus = (campaign: any) =>
    campaign?.attributes?.status ?? campaign?.status ?? "pending";

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setLoading(true);
        // Use organizer-specific endpoint so user only sees their own campaigns
        const response = await apiService.getOrganizerCampaigns({ page: 1, per_page: 100 });

        // apiService.getOrganizerCampaigns returns axios response.data where
        // the paginated resource array is available as `.data`.
        // Normalize the result to an array of campaign objects.
        let campaignList: any[] = [];
        if (Array.isArray(response?.data)) {
          campaignList = response.data;
        } else if (Array.isArray(response?.data?.data)) {
          campaignList = response.data.data;
        } else if (Array.isArray(response)) {
          campaignList = response;
        }

        setCampaigns(campaignList);
        setFilteredCampaigns(campaignList);
      } catch (error) {
        console.error("Error fetching campaigns:", error);
        setCampaigns([]);
        setFilteredCampaigns([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  useEffect(() => {
    let filtered = campaigns;

    if (searchTerm.trim() !== "") {
      filtered = filtered.filter((campaign) => {
        const campaignData = campaign.attributes || campaign;
        return (
          campaignData.title
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          campaignData.description
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase())
        );
      });
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((campaign) => {
        const campaignData = campaign.attributes || campaign;
        return campaignData.status === statusFilter;
      });
    }

    setFilteredCampaigns(filtered);
  }, [searchTerm, statusFilter, campaigns]);

  const handleDelete = async (campaignId: string) => {
    if (!confirm("Are you sure you want to delete this campaign?")) return;
    try {
      await apiService.deleteCampaign(campaignId);
      // refresh
      const resp = await apiService.getOrganizerCampaigns({ page: 1, per_page: 100 });
      const list = Array.isArray(resp?.data?.data)
        ? resp.data.data
        : Array.isArray(resp?.data)
        ? resp.data
        : Array.isArray(resp)
        ? resp
        : [];
      setCampaigns(list);
      setFilteredCampaigns(list);
    } catch (err) {
      console.error("Failed to delete campaign:", err);
      alert("Failed to delete campaign");
    }
  };

  const handleEdit = (campaign: any) => {
    // navigate to organizer edit page - adjust route if different
    navigate(`/dashboard/donee/edit-donation/${campaign.id}`);
  };

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
          <div className="text-lg">Loading campaigns...</div>
        </div>
      </DoneeLayout>
    );
  }

  return (
    <DoneeLayout>
      <div className="space-y-6 p-4 w-full">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Your Donation Campaigns</h1>
            <p className="text-muted-foreground">
              Manage and monitor your active campaigns
            </p>
          </div>
          <Link to="/dashboard/donee/donations/create">
            <Button>Create New Campaign</Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="search"
                  className="block text-sm font-medium mb-2"
                >
                  Search Campaigns
                </label>
                <Input
                  id="search"
                  placeholder="Search by title or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div>
                <label
                  htmlFor="status"
                  className="block text-sm font-medium mb-2"
                >
                  Status
                </label>
                <select
                  id="status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending Review</option>
                  <option value="on_progress">Active</option>
                  <option value="finished">Finished</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {filteredCampaigns.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-muted-foreground mb-4">
                  {campaigns.length === 0
                    ? "You haven't created any campaigns yet"
                    : "No campaigns match your search criteria"}
                </p>
                {campaigns.length === 0 ? (
                  <Link to="/dashboard/donee/donations/create">
                    <Button>Create Your First Campaign</Button>
                  </Link>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm("");
                      setStatusFilter("all");
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Your Campaigns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm table-auto">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="p-2">#</th>
                      <th className="p-2">Title</th>
                      <th className="p-2">Type</th>
                      <th className="p-2">Status</th>
                      <th className="p-2">Progress</th>
                      <th className="p-2">Created</th>
                      <th className="p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCampaigns.map((campaign, idx) => {
                      const campaignData = campaign.attributes || campaign;
                      const status = getCampaignStatus(campaign);
                      const progress = campaignData.requested_fund_amount > 0
                        ? Math.round((campaignData.donated_fund_amount / campaignData.requested_fund_amount) * 100)
                        : campaignData.requested_item_quantity > 0
                        ? Math.round((campaignData.donated_item_quantity / campaignData.requested_item_quantity) * 100)
                        : 0;

                      return (
                        <tr key={campaign.id} className="border-b">
                          <td className="p-2 align-top">{idx + 1}</td>
                          <td className="p-2 align-top">
                            <div className="font-medium">{campaignData.title}</div>
                            <div className="text-xs text-muted-foreground line-clamp-2">{campaignData.description}</div>
                          </td>
                          <td className="p-2 align-top">{campaignData.campaign_type}</td>
                          <td className="p-2 align-top">
                            <Badge className={getStatusColor(status)}>{status}</Badge>
                          </td>
                          <td className="p-2 align-top">{progress}%</td>
                          <td className="p-2 align-top">
                            <div>{campaignData.created_at}</div>
                            {campaignData.campaign_type === 'fundraiser' ? (
                              <div className="text-xs text-muted-foreground">Rp {formatPrice(campaignData.requested_fund_amount || 0)}</div>
                            ) : (
                              <div className="text-xs text-muted-foreground">{campaignData.requested_item_quantity || 0} items</div>
                            )}
                          </td>
                          <td className="p-2 align-top space-x-2">
                            <Link to={`/campaigns/${campaignData.slug || campaign.id}`}>
                              <Button variant="ghost" size="sm">View</Button>
                            </Link>
                            <Button variant="outline" size="sm" onClick={() => handleEdit(campaign)}>Edit</Button>
                            <Button variant="destructive" size="sm" onClick={() => handleDelete(campaign.id)}>Delete</Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DoneeLayout>
  );
}
