import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setLoading(true);
        const response = await apiService.getCampaigns({});

        const campaignList = Array.isArray(response?.data?.data)
          ? response.data.data
          : Array.isArray(response?.data)
          ? response.data
          : [];

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
      <div className="space-y-6">
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredCampaigns.map((campaign) => {
              const campaignData = campaign.attributes || campaign;
              const organizerName =
                campaign.relationships?.organizer?.attributes?.name ||
                campaign.relationships?.organizer?.attributes.name ||
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
                        {campaignData.status || "pending"}
                      </Badge>
                    </div>
                  </div>

                  <CardHeader>
                    <CardTitle className="line-clamp-2">
                      {campaignData.title || "Untitled Campaign"}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {campaignData.description || "No description available"}
                    </p>

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

                    <div className="flex items-center gap-2 text-sm">
                      <img
                        src="https://cdn-icons-png.flaticon.com/128/3408/3408590.png"
                        className="w-6 h-6 rounded-full"
                        alt="Organizer"
                      />
                      <span className="text-muted-foreground">
                        by {organizerName}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <Link
                        to={`/campaigns/${
                          campaignData.slug || campaign.campaign_id
                        }`}
                        className="flex-1"
                      >
                        <Button variant="outline" className="w-full">
                          View Details
                        </Button>
                      </Link>
                      {campaignData.status === "on_progress" && (
                        <Link
                          to={`/dashboard/donee/edit-donation/${campaign.campaign_id}`}
                          className="flex-1"
                        >
                          <Button className="w-full">Edit Campaign</Button>
                        </Link>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DoneeLayout>
  );
}
