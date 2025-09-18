import { useEffect, useState } from "react";
import DonorLayout from "@/Layout/AuthenticatedLayout";
import { apiService } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import type { Campaign } from "@/types";

function formatPrice(value: number): string {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export default function DonationHistory() {
  const [donations, setDonations] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const fetchDonations = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.getDonorDonations(page, 10);

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
        setError("Please login to view your donation history");
      } else {
        setError("Failed to load donation history");
      }
      setDonations([]);
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
          <div className="text-lg">Loading donation history...</div>
        </div>
      </DonorLayout>
    );
  }

  return (
    <DonorLayout>
      <div className="p-4">
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
          <Card>
            <CardHeader>
              <CardTitle>Your Donations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {donations.map((donation, index) => (
                  <div
                    key={index}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium">
                            {donation.attributes.title || "Campaign"}
                          </h3>
                          <Badge
                            className={getStatusColor(
                              donation.attributes.status
                            )}
                          >
                            {donation.attributes.status || "pending"}
                          </Badge>
                        </div>

                        <p className="text-sm text-muted-foreground mb-2">
                          Donation ID: {donation.id || "N/A"}
                        </p>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Amount:</span>
                            <p className="text-lg font-bold text-green-600">
                              Rp{" "}
                              {formatPrice(
                                donation.attributes.donated_fund_amount || 0
                              )}
                            </p>
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

                        {donation.attributes.description && (
                          <div className="mt-2">
                            <span className="font-medium text-sm">Notes:</span>
                            <p className="text-sm text-muted-foreground">
                              {donation.attributes.description}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2 ml-4">
                        {donation.id && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              (window.location.href = `/campaigns/${donation.id}`)
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
            </CardContent>
          </Card>
        )}
      </div>
    </DonorLayout>
  );
}
