import { useEffect, useState } from "react";
import { IoIosArrowForward } from "react-icons/io";
import { Link } from "react-router-dom";
import type { Campaign } from "@/types";
import { apiService } from "@/services/api";

interface CharityNewsProps {
  isMore?: boolean;
  toggle?: "fundraiser" | "product_donation";
}

function formatPrice(value: number): string {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export default function CharityNews({ isMore = true, toggle = "fundraiser" }: CharityNewsProps) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setLoading(true);
        const response = await apiService.getCampaigns({});
        
        
        let campaignData: Campaign[] = [];
        if (response.success && response.data) {
          if (Array.isArray(response.data)) {
            campaignData = response.data;
          } else if (response.data.data && Array.isArray(response.data.data)) {
            campaignData = response.data.data;
          }
        } else if (Array.isArray(response)) {
          campaignData = response;
        }

        
        const filteredCampaigns = toggle 
          ? campaignData.filter(campaign => campaign.type === toggle)
          : campaignData;

        
        const activeCampaigns = filteredCampaigns.filter(
          campaign => campaign.attributes.status === "on_progress"
        );

        setCampaigns(activeCampaigns);
      } catch (err) {
        console.error("Error fetching campaigns:", err);
        setError("Failed to load campaigns");
        setCampaigns([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, [toggle]);

  
  const showMoreLink = isMore && campaigns.length > 3;

  if (loading) {
    return (
      <div className="flex flex-col items-center w-full h-screen justify-start gap-4 pt-16">
        <h1 className="text-2xl font-bold self-start px-4">
          Berita Kampanye
        </h1>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading campaigns...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center w-full h-screen justify-start gap-4 pt-16">
        <h1 className="text-2xl font-bold self-start px-4">
          Berita Kampanye
        </h1>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-red-500">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full h-screen justify-start gap-4 pt-16">
      <h1 className="text-2xl font-bold self-start px-4">
        {toggle === "fundraiser" ? "Berita Penggalangan Dana" : "Berita Donasi Barang"}
      </h1>

      <div className="flex flex-row w-full h-3/5 justify-start items-start px-4">
        <div className="grid-cols-3 flex justify-around gap-4 items-start w-full h-full">
          {campaigns.length > 0 ? (
            campaigns.slice(0, 3).map((campaign) => {
             
              return (
                <div
                  key={campaign.campaign_id}
                  className="w-11/12 h-full bg-gray-300 rounded-lg flex relative flex-col"
                >
                  <Link
                    to={`/campaigns/${campaign.campaign_id}`}
                    className="w-full h-3/5 flex"
                  >
                    <img
                      src={
                        campaign.attributes.header_image_url
                          ? campaign.attributes.header_image_url.startsWith("/storage/")
                            ? `http://localhost:8000${campaign.attributes.header_image_url}`
                            : `http://localhost:8000/storage/${campaign.attributes.header_image_url}`
                          : "/images/Charity1.jpeg"
                      }
                      className="w-full h-3/5 rounded-b-none object-cover absolute inset-0 rounded-lg"
                      alt={campaign.attributes.title}
                      onError={(e) => {
                        e.currentTarget.src = "/images/Charity1.jpeg";
                      }}
                    />
                    <div className="w-2/12 h-6 bg-primary-accent z-10 top-1 left-1 items-center justify-center flex font-semibold text-xs relative rounded-3xl text-white">
                      <span>Berita</span>
                    </div>
                  </Link>
                  <div className="w-full h-2/5 bg-gray-300 flex-col items-start rounded-b-lg flex justify-start">
                    <div className="flex flex-col items-start justify-start py-2">
                      <h3 className="text-primary-bg w-6/12 px-4 text-xs font-semibold">
                        {campaign.relationships.organizer.attributes.name || campaign.relationships.organizer.attributes.name  || "Anonymous"}
                      </h3>
                    </div>

                    <Link
                      to={`/campaigns/${campaign.campaign_id}`}
                      className="text-primary-bg hover:text-primary-accent leading-small px-4 text-lg font-bold cursor-pointer"
                    >
                      {campaign.attributes.title}
                    </Link>
                    <div className="flex flex-col items-start justify-start w-full h-full">
                      <h1 className="text-primary-bg px-4 text-xs font-semibold cursor-pointer absolute bottom-6">
                        Terkumpul
                      </h1>
                      <h1 className="text-primary-accent px-4 text-sm font-semibold cursor-pointer absolute bottom-1">
                        {campaign.type === "fundraiser" 
                          ? `Rp ${formatPrice(campaign.attributes.donated_fund_amount)} / Rp ${formatPrice(campaign.attributes.requested_fund_amount)}`
                          : `${campaign.attributes.donated_item_quantity} / ${campaign.attributes.requested_item_quantity} Barang`
                        }
                      </h1>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-3 text-center py-8">
              <p className="text-gray-500">
                {toggle === "fundraiser" 
                  ? "Tidak ada kampanye penggalangan dana aktif" 
                  : "Tidak ada kampanye donasi barang aktif"
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {showMoreLink && (
        <div className="flex flex-row w-full items-center justify-end gap-4 px-8">
          <Link
            to="/campaigns"
            className="text-primary-fg self-end flex flex-row items-center justify-end font-semibold hover:text-primary-accent"
          >
            Lihat Kampanye Lainnya
            <IoIosArrowForward />
          </Link>
        </div>
      )}
    </div>
  );
}