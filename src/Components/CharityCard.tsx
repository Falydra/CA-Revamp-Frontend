import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/Components/ui/card";
import { Link } from "react-router-dom";
import ProgressBar from "@/Components/ui/progress-bar";
import type { Campaign } from "@/types";

interface CardWithFormProps {
  campaign: Campaign | null;
}

function formatPrice(value: number): string {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export function CardWithForm({
  campaign
}: CardWithFormProps) {
  if (!campaign) {
    return null;
  }

  const attr = campaign.attributes;

  const title = attr.title ? attr.title : "Campaign";
  const description = attr.description ? attr.description : "";
  const headerImage = attr.header_image_url ? attr.header_image_url : "/images/Charity1.jpeg";

  const displayId = campaign.campaign_id;

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
              <div className="w-full flex flex-col gap-2 items-start justify-end h-full">
                <p>Terkumpul <span className="text-primary-bg font-bold">Rp{formatPrice(attr.donated_fund_amount)}</span></p>

                <ProgressBar
                  className="w-full"
                  labelAlignment="outside"
                  isLabelVisible={false}
                  completed={attr.donated_fund_amount}
                  maxCompleted={attr.requested_fund_amount}
                />
              </div>

              <Link
                className="w-full flex h-[50px] hover:bg-primary-bg bg-primary-accent items-center justify-center rounded-md mt-4"
                to={`/campaigns/${campaign.attributes?.slug || displayId}`}
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
                e.currentTarget.src = "https://via.placeholder.com/400x300?text=Campaign+Image";
              }}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}