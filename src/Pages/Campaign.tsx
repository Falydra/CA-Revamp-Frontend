import { useEffect, useState } from "react";
// import CharityNews from "@/Components/CharityNews";
import Guest from "@/Layout/GuestLayout";
import type { Campaign } from "@/types";
import { Link } from "react-router-dom";
import { apiService } from "@/services/api";

function formatPrice(value: number): string {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export default function CampaignPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setLoading(true);
        const response = await apiService.getCampaigns();

        if (response.data) {
          if (Array.isArray(response.data)) {
            setCampaigns(response.data);
          } else if (response.data.data && Array.isArray(response.data.data)) {
            setCampaigns(response.data.data);
          } else {
            setCampaigns([]);
          }
        } else if (Array.isArray(response)) {
          setCampaigns(response);
        } else {
          setCampaigns([]);
        }
      } catch (err) {
        console.error("Error fetching campaigns:", err);
        setError("Failed to load campaigns");
        setCampaigns([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  console.log("Donation: ", campaigns);

  if (loading) {
    return (
      <Guest>
        <div className="pt-[60px] w-full flex flex-col items-center justify-center min-h-[400px]">
          <div className="text-lg">Loading campaigns...</div>
        </div>
      </Guest>
    );
  }

  if (error) {
    return (
      <Guest>
        <div className="pt-[60px] w-full flex flex-col items-center justify-center min-h-[400px]">
          <div className="text-lg text-red-500">{error}</div>
        </div>
      </Guest>
    );
  }

  return (
    <Guest>
      <div className="pt-[60px] w-full flex flex-col items-start justify-start gap-2">
        <h1 className="text-2xl font-bold px-8">Campaigns</h1>

        <div className="w-full p-8">
          <div className="grid-cols-3 grid justify-around gap-8 items-start w-full">
            {campaigns.length > 0 ? (
              campaigns.map((campaign: Campaign) => {
                return (
                  <div
                    key={campaign.id}
                    className="w-11/12 h-[300px] bg-gray-300 rounded-lg flex relative flex-col"
                  >
                    <Link
                      to={`/campaigns/${campaign.id}`}
                      className="w-full h-3/5 flex"
                    >
                      <img
                        src={campaign.attributes.header_image_url || ""}
                        className="w-full h-[180px] rounded-b-none object-cover absolute inset-0 rounded-lg"
                        alt={campaign.attributes.title}
                        onError={(e) => {
                          e.currentTarget.src = "";
                        }}
                      />
                      <div
                        className={`w-2/12 h-6 z-10 top-1 left-1 items-center justify-center flex font-semibold text-xs relative rounded-3xl text-white ${
                          campaign.type === "fundraiser"
                            ? "bg-primary-accent"
                            : "bg-green-500"
                        }`}
                      >
                        <span>
                          {campaign.attributes.requested_fund_amount >= 0
                            ? "Charity"
                            : "Items"}
                        </span>
                      </div>
                      <div
                        className={`w-2/12 h-6 z-10 top-1 -right-2  items-center justify-center flex font-semibold text-xs relative rounded-3xl text-white ${
                          campaign.attributes.status === "on_progress"
                            ? "bg-blue-500"
                            : campaign.attributes.status === "finished"
                            ? "bg-green-600"
                            : campaign.attributes.status === "pending"
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                      >
                        <span className="capitalize">
                          {campaign.attributes.status.replace("_", " ")}
                        </span>
                      </div>
                    </Link>
                    <div className="w-full h-2/5 bg-gray-300 flex-col items-start rounded-b-lg flex justify-start">
                      <Link
                        to={`/campaigns/${campaign.id}`}
                        className="text-primary-bg hover:text-primary-accent leading-small px-4 text-lg font-bold cursor-pointer"
                      >
                        {campaign.attributes.title}
                      </Link>
                      <div className="flex flex-col items-start justify-start w-full h-full">
                        <h1 className="text-primary-bg px-4 text-xs font-semibold cursor-pointer absolute bottom-6">
                          {campaign.type === "fundraiser"
                            ? "Collected"
                            : "Received"}
                        </h1>
                        <h1 className="text-primary-accent px-4 text-sm font-semibold cursor-pointer absolute bottom-1">
                          {campaign.attributes.requested_fund_amount <= 0
                            ? `${campaign.attributes.donated_item_quantity}/ ${campaign.attributes.requested_item_quantity} items`
                            : `Rp ${formatPrice(
                                parseInt(
                                  campaign.attributes.donated_fund_amount
                                )
                              )} / ${formatPrice(
                                parseInt(
                                  campaign.attributes.requested_fund_amount
                                )
                              )}`}{" "}
                        </h1>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-3 text-center py-8">
                <p className="text-gray-500">No campaigns available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Guest>
  );
}
