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
  Edit,
  Plus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/Components/ui/table";

function formatPrice(value: number): string {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export default function ManageDonations() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState<Campaign[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const fetchCampaigns = async () => {
    try {
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
          campaign.relationships?.organizer?.attributes?.name ||
          campaign.relationships?.organizer?.attributes?.name ||
          "";

        return (
          campaignData.title
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          campaignData.description
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          organizerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          campaign.id?.toLowerCase().includes(searchTerm.toLowerCase())
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
    setCurrentPage(1);
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

  const totalPages = Math.ceil(filteredCampaigns.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCampaigns = filteredCampaigns.slice(startIndex, endIndex);

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  console.log(
    "Campaigns:",
    campaigns.map((c) => c)
  );

  return (
    <AdminLayout>
      <div className="space-y-6 p-4 w-full">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Manage Campaigns</h1>
            <p className="text-muted-foreground">
              Review and manage all donation campaigns
            </p>
          </div>
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Campaign
          </Button>
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

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                Campaigns ({filteredCampaigns.length} total)
              </CardTitle>
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1}-
                {Math.min(endIndex, filteredCampaigns.length)} of{" "}
                {filteredCampaigns.length}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredCampaigns.length === 0 ? (
              <div className="text-center py-8">
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
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">#</TableHead>
                        <TableHead className="min-w-[200px]">
                          Campaign
                        </TableHead>
                        <TableHead>Organizer</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Progress</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentCampaigns.map((campaign, index) => {
                        const campaignData = campaign.attributes || campaign;
                        const organizerName =
                          campaign.relationships?.organizer.attributes.name ||
                          campaign.relationships?.organizer.attributes.name ||
                          "Anonymous";

                        const progressPercentage =
                          campaignData.requested_fund_amount >= 0
                            ? campaignData.requested_fund_amount > 0
                              ? Math.round(
                                  (campaignData.donated_fund_amount /
                                    campaignData.requested_fund_amount) *
                                    100
                                )
                              : 0
                            : campaignData.requested_item_quantity > 0
                            ? Math.round(
                                (campaignData.donated_item_quantity /
                                  campaignData.requested_item_quantity) *
                                  100
                              )
                            : 0;

                        return (
                          <TableRow key={campaign.id}>
                            <TableCell className="font-medium">
                              {startIndex + index + 1}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-3">
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
                                  className="w-12 h-12 object-cover rounded-md"
                                  onError={(e) => {
                                    e.currentTarget.src =
                                      "/images/Charity1.jpeg";
                                  }}
                                />
                                <div>
                                  <div className="font-medium line-clamp-2 max-w-[200px]">
                                    {campaignData.title || "Untitled Campaign"}
                                  </div>
                                  <div className="text-sm text-black">
                                    ID: {campaign.id}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{organizerName}</TableCell>
                            <TableCell>
                              <Badge variant="secondary">
                                {campaignData.requested_fund_amount >= 0
                                  ? "Fundraiser"
                                  : "Items"}
                              </Badge>
                            </TableCell>
                            <TableCell>
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
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <div className="w-20 bg-gray-200 rounded-full h-2">
                                    <div
                                      className="bg-blue-600 h-2 rounded-full"
                                      style={{
                                        width: `${Math.min(
                                          progressPercentage,
                                          100
                                        )}%`,
                                      }}
                                    />
                                  </div>
                                  <span className="text-sm font-medium">
                                    {progressPercentage}%
                                  </span>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {campaignData.requested_fund_amount > 0  ? (
                                    <>
                                      Rp{" "}
                                      {formatPrice(
                                        campaignData.donated_fund_amount || 0
                                      )}{" "}
                                      / Rp{" "}
                                      {formatPrice(
                                        campaignData.requested_fund_amount || 0
                                      )}
                                    </>
                                  ) : (
                                    <>
                                      {campaignData.donated_item_quantity || 0}{" "}
                                      /
                                      {campaignData.requested_item_quantity ||
                                        0}{" "}
                                      items
                                    </>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {campaignData.created_at}
                              </div>
                            </TableCell>
                            <TableCell>
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
                                        campaignData.slug || campaign.id
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
                                            campaign.id,
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
                                            campaign.id,
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
                                          campaign.id,
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
                                      handleDeleteCampaign(campaign.id)
                                    }
                                    className="text-red-600"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-muted-foreground">
                      Page {currentPage} of {totalPages}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePrevPage}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                      >
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
