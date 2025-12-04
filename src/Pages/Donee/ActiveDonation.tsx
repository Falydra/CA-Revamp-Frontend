import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import DoneeLayout from "@/Layout/AuthenticatedLayout";
import { apiService } from "@/services/api";
import type { Campaign } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { Input } from "@/Components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/Components/ui/dialog";
import { MoreHorizontal, Eye, Edit, Trash2, ClipboardCheck, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

function formatPrice(value: number): string {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export default function ActiveDonation() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [finishDialogOpen, setFinishDialogOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const getCampaignStatus = (campaign: any) =>
    campaign?.attributes?.status ?? campaign?.status ?? "pending";

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setLoading(true);
        
        const response = await apiService.getOrganizerCampaigns({ page: 1, per_page: 100 });

        
        
        
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
    setIsProcessing(true);
    try {
      await apiService.deleteCampaign(campaignId);
      
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
      setDeleteDialogOpen(false);
      setSelectedCampaign(null);
      toast.success("Campaign deleted successfully");
    } catch (err: any) {
      console.error("Failed to delete campaign:", err);
      const errorMessage = err?.response?.data?.message || "Failed to delete campaign. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEdit = (campaign: any) => {
    
    navigate(`/dashboard/donee/edit-donation/${campaign.id}`);
  };

  const handleMarkAsFinished = async (campaignId: string) => {
    setIsProcessing(true);
    try {
      const result = await apiService.finishCampaign(campaignId);
      console.log("Finish campaign result:", result);
      
      
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
      setFinishDialogOpen(false);
      setSelectedCampaign(null);
      toast.success("Campaign marked as finished successfully");
    } catch (err: any) {
      console.error("Failed to mark campaign as finished:", err);
      const errorMessage = err?.response?.data?.message || "Failed to mark campaign as finished. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
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

  if (loading) {
    return (
      <DoneeLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
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
          <Link to="/dashboard/organizer/create">
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
                  className="w-full h-9 px-2 border text-sm border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  <Link to="/dashboard/organizer/create">
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
                      <th className="p-2">Cover</th>
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
                            {campaignData.header_image_url ? (
                              <img 
                                src={campaignData.header_image_url} 
                                alt={campaignData.title}
                                className="w-16 h-12 object-cover rounded"
                              />
                            ) : (
                              <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
                                No image
                              </div>
                            )}
                          </td>
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
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <Link to={`/campaigns/${campaignData.slug || campaign.id}`} className="flex items-center cursor-pointer">
                                    <Eye className="mr-2 h-4 w-4" />
                                    View Campaign
                                  </Link>
                                </DropdownMenuItem>
                                
                                {campaignData.campaign_type === 'product_donation' && (
                                  <DropdownMenuItem asChild>
                                    <Link to={`/dashboard/organizer/campaigns/${campaignData.slug || campaign.id}/review-donations`} className="flex items-center cursor-pointer">
                                      <ClipboardCheck className="mr-2 h-4 w-4" />
                                      Review Donations
                                    </Link>
                                  </DropdownMenuItem>
                                )}
                                
                                {progress >= 100 && status !== 'finished' && (
                                  <DropdownMenuItem 
                                    onClick={() => {
                                      setSelectedCampaign(campaign);
                                      setFinishDialogOpen(true);
                                    }}
                                    className="cursor-pointer text-primary-bg"
                                  >
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Mark as Finished
                                  </DropdownMenuItem>
                                )}
                                
                                <DropdownMenuSeparator />
                                
                                <DropdownMenuItem onClick={() => handleEdit(campaign)} className="cursor-pointer">
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                
                                <DropdownMenuItem 
                                  onClick={() => {
                                    if (status === 'rejected') {
                                      setSelectedCampaign(campaign);
                                      setDeleteDialogOpen(true);
                                    }
                                  }}
                                  className={`cursor-pointer ${
                                    status === 'rejected' 
                                      ? 'text-red-600' 
                                      : 'text-gray-400 cursor-not-allowed opacity-50'
                                  }`}
                                  disabled={status !== 'rejected'}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  {status === 'rejected' ? 'Delete' : 'Delete (Rejected Only)'}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Campaign</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this campaign? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setSelectedCampaign(null);
              }}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedCampaign && handleDelete(selectedCampaign.id)}
              disabled={isProcessing}
            >
              {isProcessing ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Finish Campaign Dialog */}
      <Dialog open={finishDialogOpen} onOpenChange={setFinishDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark Campaign as Finished</DialogTitle>
            <DialogDescription>
              Are you sure you want to mark this campaign as finished? The campaign has reached its goal and will be closed for further donations.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setFinishDialogOpen(false);
                setSelectedCampaign(null);
              }}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={() => selectedCampaign && handleMarkAsFinished(selectedCampaign.id)}
              className="bg-primary-bg hover:bg-primary-bg/70"
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : "Mark as Finished"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DoneeLayout>
  );
}
