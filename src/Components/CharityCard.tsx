import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/Components/ui/card";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import ProgressBar from "@ramonak/react-progress-bar";
import { apiService } from "@/services/api";

type CampaignCard = {
  id?: string;
  id?: string;
  attributes?: {
    title?: string;
    description?: string;
    header_image_url?: string | null;
    requested_fund_amount?: number;
    donated_fund_amount?: number;
  };

  title?: string;
  description?: string;
  header_image_url?: string | null;
  requested_fund_amount?: number;
  donated_fund_amount?: number;
};

function formatPrice(value: number): string {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export function CardWithForm() {
  const [campaign, setCampaign] = useState<CampaignCard | null>(null);

  useEffect(() => {
    const loadCampaign = async () => {
      try {
        const response = await apiService.getCampaigns();

        const list = Array.isArray(response?.data?.data)
          ? response.data.data
          : Array.isArray(response?.data)
          ? response.data
          : [];

        if (Array.isArray(list) && list.length > 0) {
          setCampaign(list[0] as CampaignCard);
        }
      } catch (error) {
        console.error("Error fetching campaign:", error);
      }
    };

    loadCampaign();
  }, []);

  if (!campaign) {
    return null;
  }

  const attr = campaign.attributes ? campaign.attributes : campaign;

  const title = attr.title ? attr.title : "Campaign";
  const description = attr.description ? attr.description : "";
  const headerImage = attr.header_image_url
    ? attr.header_image_url
    : "/images/Charity1.jpeg";

  const donatedAmount =
    typeof attr.donated_fund_amount === "number" ? attr.donated_fund_amount : 0;
  const requestedAmount =
    typeof attr.requested_fund_amount === "number"
      ? attr.requested_fund_amount
      : 0;

  const progressPercentage =
    requestedAmount > 0
      ? Math.min(Math.round((donatedAmount / requestedAmount) * 100), 100)
      : 0;

  const displayId = campaign.id ? campaign.id : campaign.id;

  const words = description ? description.split(" ") : [];
  const limited = words.slice(0, 75).join(" ");
  const hasMore = words.length > 75;

  return (
    <div className="flex flex-col gap-6 w-full items-center">
      <Card className="w-9/12 flex flex-col h-96">
        <div className="flex flex-row w-full h-full">
          <div className="w-6/12 h-full justify-between items-start flex flex-col hover:text-primary-bg hover:rounded-l-xl">
            <CardHeader className="text-start text-xl">
              <CardTitle>{title}</CardTitle>
              <CardDescription>
                {limited}
                {hasMore ? "..." : null}
              </CardDescription>
            </CardHeader>

            <CardFooter className="flex w-full justify-end h-full flex-col">
              <div className="w-full flex flex-col items-start justify-end h-full">
                <h1 className="text-xl font-bold">Tersedia</h1>

                <ProgressBar
                  className="w-full"
                  labelAlignment="outside"
                  isLabelVisible={false}
                  completed={progressPercentage}
                  maxCompleted={100}
                />

                <div className="w-full flex flex-row justify-start">
                  <h2 className="font-thin text-xs self-center text-center">
                    Rp {formatPrice(donatedAmount)} / Rp{" "}
                    {formatPrice(requestedAmount)}
                  </h2>
                </div>
              </div>

              <Link
                className="w-full flex h-[50px] hover:bg-primary-bg bg-primary-accent items-center justify-center rounded-md mt-4"
                to={`/campaigns/${campaign.id || campaign.id || displayId}`}
              >
                <h3 className="text-md font-semibold text-primary-fg text-center items-center justify-center">
                  Detail
                </h3>
              </Link>
            </CardFooter>
          </div>

          <div className="w-6/12 h-full items-center justify-center flex flex-col bg-cover bg-center rounded-r-xl">
            <img
              src={headerImage}
              alt={title}
              className="w-full h-full object-cover rounded-r-xl"
              onError={(e) => {
                e.currentTarget.src =
                  "https://via.placeholder.com/400x300?text=Campaign+Image";
              }}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
