import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "@/Layout/AuthenticatedLayout";
import { apiService } from "@/services/api";
import type { Campaign } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Badge } from "@/Components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/Components/ui/dialog";
import { toast } from "sonner";
import {
  Search,
  Eye,
  Check,
  X,
  Clock,
  MoreHorizontal,
  Trash2,
  Plus,
  ChevronLeft,
  ChevronRight,
  MapPin,
  FileText,
  Package,
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
  const [selectedCampaign, setSelectedCampaign] = useState<any | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Normalize extracting the status string from different API resource shapes
  const getCampaignStatus = (campaign: any) =>
    campaign?.attributes?.status ?? campaign?.status ?? "pending";

  const fetchCampaigns = async () => {
    try {
  // Use admin endpoint so we receive pending/rejected campaigns as well
  const response = await apiService.admin.getCampaigns({ page: 1, per_page: 100 });

      // Admin endpoint returns a resource collection: { data: [...], meta: {...} }
      // apiService.admin.getCampaigns returns axios response.data already, so try these shapes:
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
        return getCampaignStatus(campaign) === statusFilter;
      });
    }

    setFilteredCampaigns(filtered);
    setCurrentPage(1);
  }, [searchTerm, statusFilter, campaigns]);

  const handleStatusUpdate = async (campaignId: string, newStatus: string) => {
    try {
      // Map UI statuses to admin API expected values
      // Backend expects 'accepted' or 'rejected' for review actions.
      let apiStatus = newStatus;
      if (newStatus === "on_progress") apiStatus = "accepted";
      if (newStatus === "rejected") apiStatus = "rejected";

      const res = await apiService.admin.updateCampaignStatus(campaignId, apiStatus);
      console.log("Admin update response:", res);
      toast.success(`Campaign ${newStatus} successfully`);
      // Refresh list
      await fetchCampaigns();
    } catch (error) {
      console.error("Error updating campaign status:", error);
      // Show more details when available
      if ((error as any)?.response) {
        console.error("Response status:", (error as any).response.status);
        console.error("Response data:", (error as any).response.data);
      }
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

  const handleViewDetail = async (campaignId: string) => {
    try {
      setLoadingDetail(true);
      setIsDetailModalOpen(true);
      
      // Fetch full campaign details including address and requested items
      const response = await apiService.getCampaign(campaignId);
      console.log("Campaign detail response:", response);
      
      // Handle different response structures
      let campaignData = null;
      if (response?.data?.data) {
        campaignData = response.data.data;
      } else if (response?.data) {
        campaignData = response.data;
      } else {
        campaignData = response;
      }
      
      setSelectedCampaign(campaignData);
    } catch (error) {
      console.error("Error fetching campaign details:", error);
      toast.error("Failed to load campaign details");
      setIsDetailModalOpen(false);
    } finally {
      setLoadingDetail(false);
    }
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
                  className="flex-1 h-9 px-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                        const status = getCampaignStatus(campaign);
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
                                    campaignData.header_image_url || "/images/Charity1.jpeg"
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
                                {campaignData.requested_fund_amount > 0
                                  ? "Fundraiser"
                                  : "Items"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(status)}>
                                <div className="flex items-center gap-1">
                                  {getStatusIcon(status)}
                                  {status}
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
                                  {campaignData.requested_fund_amount > 0 ? (
                                    <>
                                      Rp.{" "}
                                      {formatPrice(
                                        campaignData.donated_fund_amount || 0
                                      )}{" "}
                                      / Rp.{" "}
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
                                  <DropdownMenuItem 
                                    onClick={() => handleViewDetail(campaign.id)}
                                    className="cursor-pointer"
                                  >
                                    <FileText className="w-4 h-4 mr-2" />
                                    View Full Details
                                  </DropdownMenuItem>
                                  
                                  <DropdownMenuItem asChild>
                                    <Link
                                      to={`/campaigns/${
                                        campaignData.slug || campaign.id
                                      }`}
                                      className="cursor-pointer"
                                    >
                                      <Eye className="w-4 h-4 mr-2" />
                                      View Public Page
                                    </Link>
                                  </DropdownMenuItem>

                                  {status === "pending" && (
                                    <>
                                      <DropdownMenuItem
                                        onClick={() =>
                                          handleStatusUpdate(
                                            campaign.id,
                                            "on_progress"
                                          )
                                        }
                                        className="text-primary-bg cursor-pointer"
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
                                        className="text-red-600 cursor-pointer"
                                      >
                                        <X className="w-4 h-4 mr-2" />
                                        Reject
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                  {status === "on_progress" && (
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
                                    className="text-red-600 cursor-pointer"
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

        {/* Campaign Detail Modal */}
        <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Campaign Details</DialogTitle>
            </DialogHeader>

            {loadingDetail ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-lg">Loading...</div>
              </div>
            ) : selectedCampaign ? (
              <div className="space-y-6">
                {/* Campaign Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Campaign Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Campaign ID</p>
                        <p className="font-medium">{selectedCampaign.id}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Status</p>
                        <Badge className={getStatusColor(getCampaignStatus(selectedCampaign))}>
                          {getCampaignStatus(selectedCampaign)}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Campaign Type</p>
                        <p className="font-medium capitalize">
                          {selectedCampaign.attributes?.campaign_type || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Created At</p>
                        <p>{selectedCampaign.attributes?.created_at || "N/A"}</p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Title</p>
                      <p className="font-medium text-lg">{selectedCampaign.attributes?.title || "N/A"}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Description</p>
                      <p className="text-sm whitespace-pre-wrap">{selectedCampaign.attributes?.description || "N/A"}</p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Organizer</p>
                      <p className="font-medium">
                        {selectedCampaign.relationships?.organizer?.attributes?.name || "N/A"}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Address Information */}
                {selectedCampaign.relationships?.address && (
                  <Card className="border-orange-200 bg-orange-50/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-orange-600" />
                        Campaign Address (For Verification)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Address Detail</p>
                        <p>{selectedCampaign.relationships.address.address_detail || "N/A"}</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Village/Kelurahan</p>
                          <p>{selectedCampaign.relationships.address.village || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Sub-District/Kecamatan</p>
                          <p>{selectedCampaign.relationships.address.sub_district || "N/A"}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">City/Kabupaten</p>
                          <p>{selectedCampaign.relationships.address.city || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Province</p>
                          <p>{selectedCampaign.relationships.address.province || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Postal Code</p>
                          <p>{selectedCampaign.relationships.address.postal_code || "N/A"}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Donation Progress */}
                <Card>
                  <CardHeader>
                    <CardTitle>Donation Progress</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedCampaign.attributes?.requested_fund_amount > 0 ? (
                      <>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Target Amount</p>
                          <p className="text-2xl font-bold">
                            Rp {formatPrice(selectedCampaign.attributes.requested_fund_amount || 0)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Amount Raised</p>
                          <p className="text-xl font-semibold text-primary-bg">
                            Rp {formatPrice(selectedCampaign.attributes.donated_fund_amount || 0)}
                          </p>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-4">
                          <div
                            className="bg-primary-bg h-4 rounded-full transition-all"
                            style={{
                              width: `${Math.min(
                                Math.round(
                                  (selectedCampaign.attributes.donated_fund_amount /
                                    selectedCampaign.attributes.requested_fund_amount) *
                                    100
                                ),
                                100
                              )}%`,
                            }}
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Target Items</p>
                          <p className="text-2xl font-bold">
                            {selectedCampaign.attributes?.requested_item_quantity || 0} items
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Items Donated</p>
                          <p className="text-xl font-semibold text-primary-bg">
                            {selectedCampaign.attributes?.donated_item_quantity || 0} items
                          </p>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-4">
                          <div
                            className="bg-primary-bg h-4 rounded-full transition-all"
                            style={{
                              width: `${Math.min(
                                Math.round(
                                  (selectedCampaign.attributes.donated_item_quantity /
                                    selectedCampaign.attributes.requested_item_quantity) *
                                    100
                                ),
                                100
                              )}%`,
                            }}
                          />
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* Requested Items (for product donation campaigns) */}
                {selectedCampaign.relationships?.requested_items && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Requested Items</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Books */}
                      {selectedCampaign.relationships.requested_items.books?.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-3">Books</h4>
                          <div className="space-y-2">
                            {selectedCampaign.relationships.requested_items.books.map((book: any, index: number) => (
                              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <div>
                                  <p className="font-medium">{book.attributes?.title || "Unknown Title"}</p>
                                  <p className="text-sm text-muted-foreground">
                                    Author: {book.attributes?.author || "Unknown"}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    ISBN: {book.attributes?.isbn || "N/A"}
                                  </p>
                                </div>
                                <Badge variant="secondary">
                                  Qty: {book.attributes?.requested_quantity || 0}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Supplies */}
                      {selectedCampaign.relationships.requested_items.supplies?.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-3">Supplies</h4>
                          <div className="space-y-2">
                            {selectedCampaign.relationships.requested_items.supplies.map((supply: any, index: number) => (
                              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <div className="flex-1">
                                  <p className="font-medium">{supply.attributes?.name || "Unknown Supply"}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {supply.attributes?.description || "No description"}
                                  </p>
                                </div>
                                <Badge variant="secondary">
                                  Qty: {supply.attributes?.requested_quantity || 0}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {(!selectedCampaign.relationships.requested_items.books?.length && 
                        !selectedCampaign.relationships.requested_items.supplies?.length) && (
                        <p className="text-muted-foreground text-center py-4">
                          No specific items requested (bulk donation)
                        </p>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Action Buttons */}
                {getCampaignStatus(selectedCampaign) === "pending" && (
                  <div className="flex justify-end gap-4 pt-4 border-t">
                    <Button
                      variant="destructive"
                      onClick={() => {
                        handleStatusUpdate(selectedCampaign.id, "rejected");
                        setIsDetailModalOpen(false);
                      }}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Reject Campaign
                    </Button>
                    <Button
                      onClick={() => {
                        handleStatusUpdate(selectedCampaign.id, "on_progress");
                        setIsDetailModalOpen(false);
                      }}
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Approve Campaign
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No campaign data available</p>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
