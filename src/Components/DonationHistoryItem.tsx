import { IoPersonOutline } from "react-icons/io5";

function formatPrice(value: number): string {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function formatPastTime(datetime: string): string {
  const now = new Date();
  const past = new Date(datetime);
  const diffMs = now.getTime() - (past.getTime());

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return `${seconds} seconds ago`;
  if (minutes < 60) return `${minutes} minutes ago`;
  if (hours < 24) return `${hours} hours ago`;
  return `${days} days ago`;
}

interface DonationHistoryItemProps {
  type: string;
  donor: {
    name: string;
    profile_image_url?: string | null;
  };
  quantity: number;
  date: string;
}

export default function DonationHistoryItem({
  type,
  donor,
  quantity,
  date
}: DonationHistoryItemProps) {
  return (
    <div
      className="flex flex-row gap-4 px-4 py-3 border-b">
      {donor.profile_image_url ? (
        <img
          src={donor.profile_image_url}
          alt={`${donor.name} profile image`}
          className="w-12 h-12 rounded-full shadow-lg" />
      ) : (
        <div className="flex min-w-12 w-12 h-12 items-center justify-center border rounded-full text-gray-500 border-gray-500">
          <IoPersonOutline className="w-5 h-5" />
        </div>
      )}
      <div className="flex flex-row gap-2 w-full">
        <div className="flex flex-col gap-1 w-3/5 text-sm h-full">
          <p className="font-bold text-gray-700">{donor.name ?? "Kind Person"}</p>
          <p className="mt-auto">Donated <span className="font-bold text-gray-700">
            {type === "fundraiser" ? (
              `Rp${formatPrice(quantity)}`
            ) : (
              `${quantity} Item${quantity > 1 ? "s" : ""}`
            )}
          </span></p>
        </div>
        <div className="flex flex-col gap-1 w-2/5 text-sm font-medium text-gray-500 h-full items-end justify-end">
          {formatPastTime(date)}
        </div>
      </div>
    </div>
  )
}