import { useEffect, useState } from "react";
import Guest from "@/Layout/GuestLayout";
import type { Campaign } from "@/types";
import { Link } from "react-router-dom";
import { apiService } from "@/services/api";
import CampaignCard from "@/Components/CampaignCard";

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
        const response = await apiService.getCampaigns({});

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
      <div className="pt-[60px] px-16 w-full flex flex-col items-start justify-start gap-2">
        <h1 className="text-2xl font-bold px-8">Campaigns</h1>

        <div className="w-full p-8">
          <div className="grid-cols-4 grid justify-around gap-6 items-start w-full">
            {campaigns.length > 0 ? (
              campaigns.map((campaign: Campaign) => {
                return (
                  <CampaignCard 
                  campaign={campaign}
                  width="full"
                  key={campaign.attributes.slug} />
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
