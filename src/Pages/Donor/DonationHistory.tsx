import { useEffect, useState } from "react";
import DonorLayout from "@/Layout/AuthenticatedLayout";
import { apiService } from "@/services/api";
import { Card, CardContent } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { Loader2 } from "lucide-react";

function formatPrice(value: number): string {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export default function DonationHistory() {
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
      console.log("Donation history response:", response);

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
      console.error("Error details:", error.response);
      
      // Don't trigger logout on errors, just show error message
      if (error?.response?.status === 401) {
        setError("Your session has expired. Please login again.");
      } else if (error?.response?.status === 404) {
        // 404 might mean no donations endpoint, treat as no donations
        console.log("No donations endpoint found, showing empty state");
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

  if (loading) {
    return (
      <DonorLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
        </div>
      </DonorLayout>
    );
  }
  console.log("Donations: ", donations);

  return (
    <DonorLayout>
      <div className="p-4 w-full">
        <div className="flex items-center justify-between gap-8 py-2">
          <h1 className="text-2xl font-bold">Donation History</h1>
          <Button onClick={() => fetchDonations(currentPage)} variant="outline">
            Refresh
          </Button>
        </div>

        {error && (
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={() => fetchDonations(1)}>Try Again</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {!error && donations.length === 0 && (
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-muted-foreground mb-4">No donations found</p>
                <Button onClick={() => (window.location.href = "/campaigns")}>
                  Start Donating
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {!error && donations.length > 0 && (
          <div>
            
            <div>
              <div className="space-y-4">
                {donations.map((donation, index) => (
                  <div
                    key={index}
                    className=" border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium">
                            {(donation as any).relationships?.campaign?.attributes?.title || "Campaign"}
                          </h3>
                          <Badge
                            className={getStatusColor(
                              (donation as any).attributes?.status
                            )}
                          >
                            {(donation as any).attributes?.status || "pending"}
                          </Badge>
                        </div>

                        <p className="text-sm text-muted-foreground mb-2">
                          Donation ID: {donation.id || "N/A"}
                        </p>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">
                              {(donation as any).attributes?.type === 'fund' ? 'Amount:' : 'Items:'}
                            </span>
                            {(donation as any).attributes?.type === 'fund' ? (
                              <p className="text-lg font-bold text-primary-bg">
                                Rp{" "}
                                {formatPrice(
                                  typeof (donation as any).attributes?.amount === 'string' 
                                    ? parseInt((donation as any).attributes.amount, 10) 
                                    : ((donation as any).attributes?.amount || 0)
                                )}
                              </p>
                            ) : (
                              <p className="text-lg font-bold text-primary-bg">
                                {(donation as any).attributes?.items_count || 0}{" "}
                                {(donation as any).attributes?.items_count === 1 ? 'Item' : 'Items'}
                              </p>
                            )}
                          </div>

                          <div>
                            <span className="font-medium">Date:</span>
                            <p>
                              {new Date(
                                donation.created_at || Date.now()
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
                            {(donation as any).attributes?.type === 'fund' ? 'Fund Donation' : 'Item Donation'}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 ml-4">
                        {donation.id && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              (window.location.href = `/campaigns/${(donation as any).relationships?.campaign?.attributes?.slug}`)
                            }
                          >
                            View Campaign
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
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
          </div>
        )}
      </div>
    </DonorLayout>
  );
}
