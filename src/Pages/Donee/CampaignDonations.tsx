import { useEffect, useState } from "react";
import DoneeLayout from "@/Layout/AuthenticatedLayout";
import { apiService } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { Loader2, ChevronDown } from "lucide-react";
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

export default function CampaignDonations() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<any | null>(null);
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingDonations, setLoadingDonations] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);

  
  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.getDoneeCampaigns(1, 100); 
      console.log("Campaigns response:", response);

      if (response?.data) {
        const campaignList = Array.isArray(response.data.data)
          ? response.data.data
          : Array.isArray(response.data)
          ? response.data
          : [];

        setCampaigns(campaignList);
        
        
        if (campaignList.length > 0) {
          setSelectedCampaign(campaignList[0]);
          fetchDonationsForCampaign(campaignList[0].id, 1);
        }
      } else {
        setCampaigns([]);
      }
    } catch (error: any) {
      console.error("Error fetching campaigns:", error);
      setError("Failed to load campaigns");
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  
  const fetchDonationsForCampaign = async (campaignId: string, page: number = 1) => {
    try {
      setLoadingDonations(true);
      setError(null);

      console.log("Fetching donations for campaign:", campaignId);
      const response = await apiService.getCampaignDonations(campaignId, page, 10);
      console.log("Donations response:", response);

      if (response?.data) {
        const donationList = Array.isArray(response.data.data)
          ? response.data.data
          : Array.isArray(response.data)
          ? response.data
          : [];

        console.log("Parsed donations:", donationList);
        setDonations(donationList);
        setTotalPages(response.data.last_page || 1);
        setCurrentPage(response.data.current_page || page);
      } else {
        setDonations([]);
      }
    } catch (error: any) {
      console.error("Error fetching donations:", error);
      console.error("Error response:", error?.response);
      console.error("Error status:", error?.response?.status);
      console.error("Error data:", error?.response?.data);
      
      if (error?.response?.status === 404) {
        setDonations([]);
        setError(null);
      } else if (error?.response?.status === 403) {
        setError("You don't have permission to view these donations");
      } else if (error?.response?.status === 401) {
        setError("Please log in to view donations");
      } else {
        setError("Failed to load donations");
      }
    } finally {
      setLoadingDonations(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleCampaignSelect = (campaign: any) => {
    setSelectedCampaign(campaign);
    fetchDonationsForCampaign(campaign.id, 1);
  };

  const handlePageChange = (page: number) => {
    if (selectedCampaign) {
      fetchDonationsForCampaign(selectedCampaign.id, page);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "success":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getDonorName = (donation: any) => {
    
    const donorName = donation.attributes?.donor_name;
    
    return donorName || "Unknown";
  };

  const getDonorEmail = (donation: any) => {
    
    const donorId = donation.attributes?.donor_id;
    const donorEmail = donation.relationships?.donor?.attributes?.email;
    
    
    if (!donorId) {
      return "Guest Account";
    }
    
    return donorEmail || "Guest Account";
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
      <div className="space-y-6 w-full p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Donation History</h1>
            <p className="text-muted-foreground">
              View donations received for your campaigns
            </p>
          </div>
          <Button onClick={fetchCampaigns} variant="outline">
            Refresh
          </Button>
        </div>

        {error && (
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={fetchCampaigns}>Try Again</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {!error && campaigns.length === 0 && (
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-muted-foreground mb-4">
                  You haven't created any campaigns yet
                </p>
                <Button onClick={() => (window.location.href = "/dashboard/donee/create-campaign")}>
                  Create Campaign
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {!error && campaigns.length > 0 && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Select Campaign</CardTitle>
              </CardHeader>
              <CardContent>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full sm:w-auto justify-between min-w-[300px]">
                      {selectedCampaign 
                        ? selectedCampaign.attributes?.title || "Select a campaign"
                        : "Select a campaign"}
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[300px] max-h-[400px] overflow-y-auto">
                    {campaigns.map((campaign) => (
                      <DropdownMenuItem
                        key={campaign.id}
                        onClick={() => handleCampaignSelect(campaign)}
                        className="cursor-pointer"
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {campaign.attributes?.title}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            ID: {campaign.id}
                          </span>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardContent>
            </Card>

            {selectedCampaign && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>
                      Donations for "{selectedCampaign.attributes?.title}"
                    </CardTitle>
                    <div className="text-sm text-muted-foreground">
                      {donations.length} donation(s)
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {loadingDonations ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : donations.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        No donations received yet for this campaign
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>#</TableHead>
                              <TableHead>Donor Name</TableHead>
                              <TableHead>Email</TableHead>
                              <TableHead>Type</TableHead>
                              <TableHead>Amount/Items</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Date</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {donations.map((donation, index) => (
                              <TableRow key={donation.id}>
                                <TableCell className="font-medium">
                                  {(currentPage - 1) * 10 + index + 1}
                                </TableCell>
                                <TableCell>
                                  {getDonorName(donation)}
                                </TableCell>
                                <TableCell>
                                  {getDonorEmail(donation)}
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline" className="capitalize">
                                    {donation.attributes?.type || "N/A"}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  {donation.attributes?.type === 'fund' ? (
                                    <span className="font-semibold">
                                      Rp{" "}
                                      {formatPrice(
                                        typeof donation.attributes?.amount === 'string'
                                          ? parseInt(donation.attributes.amount, 10)
                                          : (donation.attributes?.amount || 0)
                                      )}
                                    </span>
                                  ) : (
                                    <span className="font-semibold">
                                      {donation.attributes?.items_count || 0}{" "}
                                      {donation.attributes?.items_count === 1 ? 'Item' : 'Items'}
                                    </span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    className={getStatusColor(
                                      donation.attributes?.status
                                    )}
                                  >
                                    {donation.attributes?.status || "pending"}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  {new Date(
                                    donation.attributes?.created_at || Date.now()
                                  ).toLocaleDateString("id-ID", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>

                      {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-4">
                          <div className="text-sm text-muted-foreground">
                            Page {currentPage} of {totalPages}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePageChange(currentPage - 1)}
                              disabled={currentPage <= 1}
                            >
                              Previous
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePageChange(currentPage + 1)}
                              disabled={currentPage >= totalPages}
                            >
                              Next
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </DoneeLayout>
  );
}
