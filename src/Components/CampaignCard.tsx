import type { Campaign } from "@/types";
import { Link } from "react-router-dom";
import ProgressBar from "./ui/progress-bar";

interface CampaignCardProps {
  campaign: Campaign;
  minWidth?: string;
  width?: string;
  minHeight?: string;
  height?: string;
}

function formatPrice(value: number): string {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export default function CampaignCard({
  campaign,
  minWidth,
  width,
  minHeight,
  height
}: CampaignCardProps) {
  const attr = campaign.attributes;
  const type = attr.requested_item_quantity > 0 ? "product_donation" : "fundraiser";

  const thumbnail = attr.header_image_url ? attr.header_image_url : "";
  const status = attr.status;

  const relationships = campaign.relationships;
  const organizer = relationships.organizer;
  if (!campaign) {
    return null;
  }

  return (
    <Link to={`/campaigns/${attr.slug}`} className={`flex flex-col min-w-80 max-w-full 
      min-w-${minWidth ? minWidth : "0"}
      min-h-${minHeight ? minHeight : "0"}
      w-${width ? width : "80"} 
      h-${height ? height : "full"} 
      rounded-xl shadow-lg`}>
      <header
        className="min-h-40 max-h-40 p-4 bg-cover bg-center rounded-t-xl"
        style={{ backgroundImage: `url(${thumbnail})` }}>
        <p className={`w-fit px-3 py-1 rounded-full text-xs font-semibold text-white capitalize ${status === "on_progress"
          ? "bg-blue-500"
          : status === "finished"
            ? "bg-green-600"
            : status === "pending"
              ? "bg-yellow-500"
              : "bg-red-500"
          }`}>
          {status.replace("_", " ")}
        </p>
      </header>
      <footer className="flex flex-col p-4 gap-2 h-full">
        <p className="text-sm text-black/50">organized by
          <span className="font-semibold text-primary-bg/90"> {organizer.attributes.name}</span>
        </p>
        <h3 className="font-semibold">{attr.title}</h3>
        <p className="text-sm text-black/75 line-clamp-2">{attr.description}</p>

        {type == "product_donation" ? (
          <div className="flex flex-col gap-2">
            <p className="text-sm">Raised <span className="text-blue-500 font-semibold">{campaign.attributes.donated_item_quantity} Items</span></p>
            <ProgressBar
              completed={attr.donated_item_quantity}
              maxCompleted={attr.requested_item_quantity}
              isLabelVisible={false}>
            </ProgressBar>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <p className="text-sm">Raised <span className="text-blue-500 font-semibold">Rp {formatPrice(campaign.attributes.donated_fund_amount)},00</span></p>
            <ProgressBar
              completed={attr.donated_fund_amount}
              maxCompleted={attr.requested_fund_amount}
              isLabelVisible={false}>
            </ProgressBar>
          </div>
        )}
      </footer>
    </Link>
  );
}