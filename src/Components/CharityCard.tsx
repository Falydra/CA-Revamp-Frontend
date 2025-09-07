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
import type { Campaign } from "@/types/index.d";

function formatPrice(value: number): string {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export function CardWithForm() {
  const [campaign, setCampaign] = useState<Campaign | null>(null);

  useEffect(() => {
    const loadCampaign = async () => {
      try {
       
      
        
        const response = await apiService.getCampaigns();
        
       


        if (response.data && response.data.length > 0) {
          setCampaign(response.data[0]);
        }
      } catch (error) {
        console.error("Error fetching campaign:", error);
      }
    };

    loadCampaign();
  }, []);


  if (!campaign || !campaign.attributes) {
    return null;
  }


  
  const donatedAmount = campaign.attributes.donated_fund_amount;
  const requestedAmount = campaign.attributes.requested_fund_amount;
  const progressPercentage = Math.round((donatedAmount / requestedAmount) * 100);

  return (
    <div className="flex flex-col gap-6 w-full items-center">
      <Card className="w-9/12 flex flex-col h-96">
        <div className="flex flex-row w-full h-full">
          <div className="w-6/12 h-full justify-between items-start flex flex-col hover:text-primary-bg hover:rounded-l-xl">
            <CardHeader className="text-start text-xl">
              <CardTitle>{campaign.attributes.title}</CardTitle>
              <CardDescription>
                {campaign.attributes.description
                  ?.split(" ")
                  .slice(0, 75)
                  .join(" ") +
                  (campaign.attributes.description?.split(" ").length > 75
                    ? "..."
                    : "")}
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
                    Rp {formatPrice(donatedAmount)} / Rp {formatPrice(requestedAmount)}
                  </h2>
                </div>
              </div>

              <Link
                className="w-full flex h-[50px] hover:bg-primary-bg bg-primary-accent items-center justify-center rounded-md mt-4"
                to={`/donation/${campaign.id}`}
              >
                <h3 className="text-md font-semibold text-primary-fg text-center items-center justify-center">
                  Detail
                </h3>
              </Link>
            </CardFooter>
          </div>

          <div className="w-6/12 h-full items-center justify-center flex flex-col bg-cover bg-center rounded-r-xl">
            <img
              src={campaign.attributes.header_image_url || "/images/Charity1.jpeg"}
              alt={campaign.attributes.title}
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