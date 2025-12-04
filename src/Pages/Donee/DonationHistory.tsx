import { useEffect, useState } from "react";
import DoneeLayout from "@/Layout/AuthenticatedLayout";
import { apiService } from "@/services/api";
import { Card, CardContent } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { Loader2 } from "lucide-react";

function formatPrice(value: number): string {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export default function DoneeHistory() {
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const fetchDonations = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.getDonorDonations(page, 10);
      console.log("Organizer donation history response:", response);

      if (response?.data) {
        const donationList = Array.isArray(response.data.data)
          ? response.data.data
          : Array.isArray(response.data)
          ? response.data
          : [];

        setDonations(donationList);
        setTotalPages(response.data.last_page || 1);
        setCurrentPage(response.data.current_page || 1);
      } else {
        setDonations([]);
      }
    } catch (error: any) {
      console.error("Error fetching donation history:", error);
      
      if (error?.response?.status === 401) {
        setError("Your session has expired. Please login again.");
      } else if (error?.response?.status === 404) {
        setDonations([]);
        setError(null);
      } else {
        setError("Failed to load donation history. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations(1);
  }, []);

  const handlePageChange = (page: number) => {
    fetchDonations(page);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "success":
      case "paid":
      case "received":
        return "bg-green-100 text-green-800";
      case "pending":
      case "on_delivery":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
      case "cancelled":
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
      <div className="p-4 w-full">
        <div className="flex items-center justify-between gap-8 py-2">
          <div>
            <h1 className="text-2xl font-bold">My Donation History</h1>
            <p className="text-muted-foreground">
              View your personal donations to campaigns
            </p>
          </div>
          <Button onClick={() => fetchDonations(currentPage)} variant="outline">
            Refresh
          </Button>
        </div>

        {error && (
          <Card className="mt-4">
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={() => fetchDonations(1)}>Try Again</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {!error && donations.length === 0 && (
          <Card className="mt-4">
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-muted-foreground mb-4">No donations found</p>
                <Button onClick={() => (window.location.href = "/campaigns")}>
                  Browse Campaigns
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {!error && donations.length > 0 && (
          <div className="mt-4">
            <div className="space-y-4">
              {donations.map((donation, index) => (
                <Card key={donation.id || index}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium">
                            {donation.relationships?.campaign?.attributes?.title || "Campaign"}
                          </h3>
                          <Badge
                            className={getStatusColor(
                              donation.attributes?.status
                            )}
                          >
                            {donation.attributes?.status || "pending"}
                          </Badge>
                        </div>

                        <p className="text-sm text-muted-foreground mb-2">
                          Donation ID: {donation.id || "N/A"}
                        </p>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">
                              {donation.attributes?.type === 'fund' ? 'Amount:' : 'Items:'}
                            </span>
                            {donation.attributes?.type === 'fund' ? (
                              <p className="text-lg font-bold text-primary-bg">
                                Rp{" "}
                                {formatPrice(
                                  typeof donation.attributes?.amount === 'string' 
                                    ? parseInt(donation.attributes.amount, 10) 
                                    : (donation.attributes?.amount || 0)
                                )}
                              </p>
                            ) : (
                              <p className="text-lg font-bold text-primary-bg">
                                {donation.attributes?.items_count || 0}{" "}
                                {donation.attributes?.items_count === 1 ? 'Item' : 'Items'}
                              </p>
                            )}
                          </div>

                          <div>
                            <span className="font-medium">Date:</span>
                            <p>
                              {new Date(
                                donation.attributes?.created_at || donation.created_at || Date.now()
                              ).toLocaleDateString("id-ID", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>

                        <div className="mt-2">
                          <span className="font-medium text-sm">Type:</span>
                          <p className="text-sm text-muted-foreground capitalize">
                            {donation.attributes?.type === 'fund' ? 'Fund Donation' : 'Item Donation'}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 ml-4">
                        {donation.relationships?.campaign?.attributes?.slug && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              (window.location.href = `/campaigns/${donation.relationships.campaign.attributes.slug}`)
                            }
                          >
                            View Campaign
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
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
          </div>
        )}
      </div>
    </DoneeLayout>
  );
}
