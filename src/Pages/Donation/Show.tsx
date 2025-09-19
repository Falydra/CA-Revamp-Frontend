import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { type Campaign } from "@/types";
import { apiService } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { Button } from "@/Components/ui/button";
import AuthenticatedLayout from "@/Layout/AuthenticatedLayout";
import DonatedItemList from "./DonatedItemList";
import ProgressBar from "@ramonak/react-progress-bar";
import { Edit, ArrowLeft } from "lucide-react";

export default function ShowDonation() {
  const { id } = useParams<{ id: string }>();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCampaign = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const response = await apiService.getCampaign(id);

        if (response.data?.success && response.data.data) {
          setCampaign(response.data.data);
        } else {
          setError("Campaign not found");
        }
      } catch (err) {
        console.error("Error fetching campaign:", err);
        setError("Failed to load campaign details");
      } finally {
        setLoading(false);
      }
    };

    fetchCampaign();
  }, [id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "on_progress":
        return "bg-blue-100 text-blue-800";
      case "finished":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "on_progress":
        return "Sedang Berjalan";
      case "finished":
        return "Selesai";
      case "pending":
        return "Menunggu Persetujuan";
      case "rejected":
        return "Ditolak";
      default:
        return status;
    }
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(amount);
  };

  if (loading) {
    return (
      <AuthenticatedLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg">Loading campaign details...</div>
        </div>
      </AuthenticatedLayout>
    );
  }

  if (error || !campaign) {
    return (
      <AuthenticatedLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="text-lg text-red-500 mb-4">
            {error || "Campaign not found"}
          </div>
          <Link to="/dashboard/donee">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </AuthenticatedLayout>
    );
  }

  const progressPercentage =
    campaign.type === "fundraiser"
      ? campaign.attributes.requested_fund_amount > 0
        ? Math.min(
            (campaign.attributes.donated_fund_amount /
              campaign.attributes.requested_fund_amount) *
              100,
            100
          )
        : 0
      : campaign.attributes.requested_item_quantity > 0
      ? Math.min(
          (campaign.attributes.donated_item_quantity /
            campaign.attributes.requested_item_quantity) *
            100,
          100
        )
      : 0;

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/dashboard/donee">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">
                {campaign.attributes.title}
              </h1>
              <p className="text-muted-foreground">Campaign Details</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={getStatusColor(campaign.attributes.status)}>
              {getStatusText(campaign.attributes.status)}
            </Badge>
            {campaign.attributes.status === "pending" && (
              <Button size="sm">
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {campaign.attributes.header_image_url && (
              <Card>
                <CardContent className="p-0">
                  <img
                    src={
                      campaign.attributes.header_image_url.startsWith(
                        "/storage/"
                      )
                        ? `http://localhost:8000${campaign.attributes.header_image_url}`
                        : `http://localhost:8000/storage/${campaign.attributes.header_image_url}`
                    }
                    alt={campaign.attributes.title}
                    className="w-full h-64 object-cover rounded-t-lg"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {campaign.attributes.description ||
                    "No description available."}
                </p>
              </CardContent>
            </Card>

            <DonatedItemList
              campaignId={campaign.id}
              campaignType={campaign.type as "fundraiser" | "product_donation"}
            />
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Campaign Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ProgressBar
                  completed={progressPercentage}
                  maxCompleted={100}
                  labelAlignment="outside"
                  labelColor="#374151"
                />

                <div className="space-y-2">
                  {campaign.type === "fundraiser" ? (
                    <>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">
                          Terkumpul:
                        </span>
                        <span className="text-sm font-semibold">
                          {formatPrice(campaign.attributes.donated_fund_amount)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Target:</span>
                        <span className="text-sm font-semibold">
                          {formatPrice(
                            campaign.attributes.requested_fund_amount
                          )}
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">
                          Terkumpul:
                        </span>
                        <span className="text-sm font-semibold">
                          {campaign.attributes.donated_item_quantity} items
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Target:</span>
                        <span className="text-sm font-semibold">
                          {campaign.attributes.requested_item_quantity} items
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Campaign Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Type</p>
                  <p className="font-semibold capitalize">
                    {campaign.type === "fundraiser"
                      ? "Penggalangan Dana"
                      : "Donasi Produk"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Created</p>
                  <p className="font-semibold">
                    {new Date(
                      campaign.attributes.created_at
                    ).toLocaleDateString("id-ID")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Organizer</p>
                  <p className="font-semibold">
                    {campaign.relationships?.organizer?.attributes?.name ||
                      campaign.relationships?.organizer?.attributes?.name ||
                      "Anonymous"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
