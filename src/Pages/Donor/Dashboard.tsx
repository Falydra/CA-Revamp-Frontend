import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DonorLayout from "@/Layout/AuthenticatedLayout";
import { apiService } from "@/services/api";
import type { User, Campaign } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";

function formatPrice(value: number): string {
  if (value == 0) {
    return "0";
  }
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}


export default function DonorDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalDonations: 0,
    totalAmount: 0,
    activeCampaigns: 0,
  });

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);

        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }

        const campaignResponse = await apiService.getCampaigns({});

        const campaignList = Array.isArray(campaignResponse?.data?.data)
          ? campaignResponse.data.data
          : Array.isArray(campaignResponse?.data)
          ? campaignResponse.data
          : [];
        setCampaigns(campaignList.slice(0, 6));
        try {
          const donationResponse = await apiService.getDonorDonations(1, 5);
          const donationList = Array.isArray(donationResponse?.data?.data)
            ? donationResponse.data.data
            : Array.isArray(donationResponse?.data)
            ? donationResponse.data
            : [];
          setDonations(donationList);

          const totalDonations = donationList.length;
          const totalAmount = donationList.reduce(
            (sum: number, donation: any) => {
              return sum + (donation.amount || 0);
            },
            0
          );

          setStats({
            totalDonations,
            totalAmount,
            activeCampaigns: campaignList.filter(
              (c: Campaign) =>
                c.attributes?.status === "on_progress" ||
                c.attributes?.status === "pending"
            ).length,
          });
        } catch (donationError) {
          console.log("Could not fetch donations:", donationError);
          setDonations([]);
        }
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <DonorLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg">Loading dashboard...</div>
        </div>
      </DonorLayout>
    );
  }

  return (
    <DonorLayout>
      <div className="space-y-6 p-4">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg">
          <h1 className="text-2xl font-bold">
            Welcome back, {user?.name || "Donor"}!
          </h1>
          <p className="text-blue-100 mt-2">
            Thank you for making a difference in the community
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Donations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalDonations}</div>
              <p className="text-xs text-muted-foreground">
                Your contribution count
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Amount
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                Rp {formatPrice(stats.totalAmount)}
              </div>
              <p className="text-xs text-muted-foreground">
                Total donated amount
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Campaigns
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeCampaigns}</div>
              <p className="text-xs text-muted-foreground">
                Currently available
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Donations</CardTitle>
            <Link to="/dashboard/donor/history">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {donations.length > 0 ? (
              <div className="space-y-4">
                {donations.slice(0, 3).map((donation, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">
                        {donation.campaign?.attributes?.title ||
                          donation.campaign?.title ||
                          "Campaign"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(
                          donation.created_at || Date.now()
                        ).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">
                        Rp {formatPrice(donation.amount || 0)}
                      </p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {donation.status || "pending"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No donations yet</p>
                <Link to="/campaigns">
                  <Button className="mt-4">Start Donating</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Available Campaigns</CardTitle>
            <Link to="/campaigns">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {campaigns.map((campaign) => {
                const campaignData = campaign.attributes || campaign;
                const organizerName =
                  campaign.relationships?.organizer?.attributes?.name ||
                  campaign.relationships?.organizer.attributes?.name ||
                  "Anonymous";

                return (
                  <div
                    key={campaign.id}
                    className="border rounded-lg p-4 hover:shadow-lg transition-shadow"
                  >
                    <img
                      src={
                        campaignData.header_image_url || "/images/Charity1.jpeg"
                        
                      }
                      alt={campaignData.title || "Campaign"}
                      className="w-full h-32 object-cover rounded-md mb-3"
                      onError={(e) => {
                        e.currentTarget.src = "/images/Charity1.jpeg";
                      }}
                    />
                    <h3 className="font-medium mb-2 line-clamp-2">
                      {campaignData.title || "Untitled Campaign"}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {campaignData.description || "No description available"}
                    </p>

                    {campaign.type === "fundraiser" && (
                      <div className="mb-3">
                        <div className="flex justify-between text-sm mb-1">
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
                        <p className="text-xs text-muted-foreground mt-1">
                          Rp{" "}
                          {formatPrice(campaignData.donated_fund_amount || 0)} /
                          Rp{" "}
                          {formatPrice(campaignData.requested_fund_amount || 0)}
                        </p>
                      </div>
                    )}

                    {campaign.type === "product_donation" && (
                      <div className="mb-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progress</span>
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
                        <p className="text-xs text-muted-foreground mt-1">
                          {campaignData.donated_item_quantity || 0} /{" "}
                          {campaignData.requested_item_quantity || 0} items
                        </p>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-sm mb-3">
                      <img
                        src="https://cdn-icons-png.flaticon.com/128/3408/3408590.png"
                        className="w-6 h-6 rounded-full"
                        alt="Organizer"
                      />
                      <span className="text-muted-foreground">
                        by {organizerName}
                      </span>
                    </div>

                    <Link to={`/campaigns/${campaignData.slug || campaign.id}`}>
                      <Button
                        size="sm"
                        className="w-full"
                        disabled={
                          campaignData.status === "finished" ||
                          campaignData.status === "rejected"
                        }
                      >
                        {campaignData.status === "on_progress" ||
                        campaignData.status === "pending"
                          ? "View Details"
                          : "Campaign Ended"}
                      </Button>
                    </Link>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </DonorLayout>
  );
}
