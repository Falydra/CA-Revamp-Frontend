import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "@/Layout/AuthenticatedLayout";
import { apiService } from "@/services/api";
import type { Campaign } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Badge } from "@/Components/ui/badge";
import { toast } from "sonner";
import {
  Search,
  Eye,
  Check,
  X,
  Clock,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";

function formatPrice(value: number): string {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export default function ManageDonations() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const response = await apiService.getCampaigns();

      const campaignList = Array.isArray(response?.data?.data)
        ? response.data.data
        : Array.isArray(response?.data)
        ? response.data
        : [];

      setCampaigns(campaignList);
      setFilteredCampaigns(campaignList);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      toast.error("Failed to load campaigns");
      setCampaigns([]);
      setFilteredCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  useEffect(() => {
    let filtered = campaigns;

    
    if (searchTerm.trim() !== "") {
      filtered = filtered.filter((campaign) => {
        const campaignData = campaign.attributes || campaign;
        const organizerName =
          campaign.relationships?.organizer?.attriutes?.name ||
          campaign.relationships?.organizer?.attriutes?.name ||
          "";

        return (
          campaignData.title
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          campaignData.description
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          organizerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          campaign.campaign_id?.toLowerCase().includes(searchTerm.toLowerCase())
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

  const handleStatusUpdate = async (campaignId: string, newStatus: string) => {
    try {
      await apiService.admin.updateCampaignStatus(campaignId, newStatus);
      toast.success(`Campaign ${newStatus} successfully`);
      fetchCampaigns();
    } catch (error) {
      console.error("Error updating campaign status:", error);
      toast.error("Failed to update campaign status");
    }
  };

  const handleDeleteCampaign = async (campaignId: string) => {
    if (!confirm("Are you sure you want to delete this campaign?")) return;

    try {
      await apiService.admin.deleteCampaign(campaignId);
      toast.success("Campaign deleted successfully");
      fetchCampaigns();
    } catch (error) {
      console.error("Error deleting campaign:", error);
      toast.error("Failed to delete campaign");
    }
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "on_progress":
        return <Check className="w-4 h-4" />;
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "finished":
        return <Check className="w-4 h-4" />;
      case "rejected":
        return <X className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg">Loading campaigns...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Manage Campaigns</h1>
            <p className="text-muted-foreground">
              Review and manage all donation campaigns
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Search & Filter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search by title, description, organizer, or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="flex-1 p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending Review</option>
                  <option value="on_progress">Active</option>
                  <option value="finished">Finished</option>
                  <option value="rejected">Rejected</option>
                </select>
                <Button onClick={fetchCampaigns} variant="outline">
                  Refresh
                </Button>
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
                    ? "No campaigns found"
                    : "No campaigns match your search criteria"}
                </p>
                {searchTerm || statusFilter !== "all" ? (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm("");
                      setStatusFilter("all");
                    }}
                  >
                    Clear Filters
                  </Button>
                ) : null}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredCampaigns.map((campaign) => {
              const campaignData = campaign.attributes || campaign;
              const organizerName =
                campaign.relationships?.organizer?.attriutes?.name ||
                campaign.relationships?.organizer?.attriutes?.name ||
                "Anonymous";

              return (
                <Card
                  key={campaign.campaign_id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <div className="aspect-video relative overflow-hidden rounded-t-lg">
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
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/images/Charity1.jpeg";
                      }}
                    />
                    <div className="absolute top-2 right-2">
                      <Badge
                        className={getStatusColor(
                          campaignData.status || "pending"
                        )}
                      >
                        <div className="flex items-center gap-1">
                          {getStatusIcon(campaignData.status || "pending")}
                          {campaignData.status || "pending"}
                        </div>
                      </Badge>
                    </div>
                    <div className="absolute top-2 left-2">
                      <Badge variant="secondary">
                        {campaign.type === "fundraiser"
                          ? "Fundraiser"
                          : "Items"}
                      </Badge>
                    </div>
                  </div>

                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="line-clamp-2 text-base">
                        {campaignData.title || "Untitled Campaign"}
                      </CardTitle>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link
                              to={`/campaigns/${
                                campaignData.slug || campaign.campaign_id
                              }`}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          {campaignData.status === "pending" && (
                            <>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleStatusUpdate(
                                    campaign.campaign_id,
                                    "on_progress"
                                  )
                                }
                                className="text-green-600"
                              >
                                <Check className="w-4 h-4 mr-2" />
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleStatusUpdate(
                                    campaign.campaign_id,
                                    "rejected"
                                  )
                                }
                                className="text-red-600"
                              >
                                <X className="w-4 h-4 mr-2" />
                                Reject
                              </DropdownMenuItem>
                            </>
                          )}
                          {campaignData.status === "on_progress" && (
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusUpdate(
                                  campaign.campaign_id,
                                  "finished"
                                )
                              }
                              className="text-blue-600"
                            >
                              <Check className="w-4 h-4 mr-2" />
                              Mark Finished
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() =>
                              handleDeleteCampaign(campaign.campaign_id)
                            }
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {campaignData.description || "No description available"}
                    </p>

                    <div className="text-sm">
                      <p>
                        <strong>Organizer:</strong> {organizerName}
                      </p>
                      <p>
                        <strong>Campaign ID:</strong> {campaign.campaign_id}
                      </p>
                      <p>
                        <strong>Created:</strong>{" "}
                        {new Date(
                          campaignData.created_at || Date.now()
                        ).toLocaleDateString()}
                      </p>
                    </div>

                    {campaign.type === "fundraiser" ? (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>
                            {campaignData.requested_fund_amount > 0
                              ? Math.round(
                                  (campaignData.donated_fund_amount /
                                    campaignData.requested_fund_amount) *
                                    100
                                )
                              : 0}
                            %
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${
                                campaignData.requested_fund_amount > 0
                                  ? Math.min(
                                      (campaignData.donated_fund_amount /
                                        campaignData.requested_fund_amount) *
                                        100,
                                      100
                                    )
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>
                            Rp{" "}
                            {formatPrice(campaignData.donated_fund_amount || 0)}
                          </span>
                          <span>
                            Rp{" "}
                            {formatPrice(
                              campaignData.requested_fund_amount || 0
                            )}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Items Collected</span>
                          <span>
                            {campaignData.requested_item_quantity > 0
                              ? Math.round(
                                  (campaignData.donated_item_quantity /
                                    campaignData.requested_item_quantity) *
                                    100
                                )
                              : 0}
                            %
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{
                              width: `${
                                campaignData.requested_item_quantity > 0
                                  ? Math.min(
                                      (campaignData.donated_item_quantity /
                                        campaignData.requested_item_quantity) *
                                        100,
                                      100
                                    )
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>
                            {campaignData.donated_item_quantity || 0} items
                          </span>
                          <span>
                            {campaignData.requested_item_quantity || 0} needed
                          </span>
                        </div>
                      </div>
                    )}

                    {campaignData.status === "pending" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() =>
                            handleStatusUpdate(
                              campaign.campaign_id,
                              "on_progress"
                            )
                          }
                          className="flex-1"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() =>
                            handleStatusUpdate(campaign.campaign_id, "rejected")
                          }
                          className="flex-1"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
