import type { Campaign, User } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { useEffect, useState } from "react";
import { apiService } from "@/services/api";

function formatPrice(value: number): string {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

type requestData = {
  fund_amount: number;
  username?: string;
};

interface DonateFundFormProps {
  campaign: Campaign | null;
}

export default function DonateFundForm({ campaign }: DonateFundFormProps) {
  const user: User = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user") || "{}")
    : undefined;

  const [requestData, setRequestData] = useState<requestData>({
    fund_amount: 0,
  });

  const handleSubmitDonation = async () => {
    try {
      if (campaign) {
        const formData = new FormData();
        formData.append("fund_amount", String(requestData.fund_amount));
        if (requestData.username) {
          formData.append("username", String(requestData.username));
        }

        const response = await apiService.createDonation(
          campaign.attributes.slug,
          formData
        );

        if (response.success) {
          const redirectUrl = response.data.redirect_url;
          window.location.href = redirectUrl;
        }
      }
    } catch (e) {
      console.log("[Error] - Error creating donation instance");
      console.log("[Error] -", e);
    }
  };

  return (
    <DialogContent>
      <DialogHeader className="flex flex-col gap-4">
        <DialogTitle>Confirm your donation</DialogTitle>
        <div className="flex flex-col gap-4">
          {!user && (
            <section className="flex flex-col">
              <label
                htmlFor="username"
                className="flex flex-col gap-2 text-gray-600"
              >
                <span className="font-bold hover:cursor-pointer">
                  Enter Your Username
                </span>
                <input
                  type="text"
                  name="username"
                  id="username"
                  className="border py-2 px-3 rounded-lg outline-none"
                  value={requestData.username}
                  placeholder="Kind Donor"
                  onChange={(e) =>
                    setRequestData((prev) => ({
                      ...prev,
                      username: e.target.value,
                    }))
                  }
                  disabled={!!user}
                />
              </label>
            </section>
          )}

          <section className="flex flex-col gap-2">
            <label
              htmlFor="donation-amount"
              className="flex flex-col gap-2 text-gray-600"
            >
              <span className="font-bold hover:cursor-pointer">
                Enter Donation Amount
              </span>
            </label>
            <div className="flex flex-row gap-2 h-12">
              <button
                className="border w-full h-full items-center justify-center rounded-lg text-blue-600 font-medium border-blue-500 hover:bg-blue-500 hover:text-white active:bg-blue-600 transition-colors duration-100"
                onClick={(e) =>
                  setRequestData((prev) => ({ ...prev, fund_amount: 30000 }))
                }
              >
                Rp30.000
              </button>
              <button
                className="border w-full h-full items-center justify-center rounded-lg text-blue-600 font-medium border-blue-500 hover:bg-blue-500 hover:text-white active:bg-blue-600 transition-colors duration-100"
                onClick={(e) =>
                  setRequestData((prev) => ({ ...prev, fund_amount: 50000 }))
                }
              >
                Rp50.000
              </button>
              <button
                className="border w-full h-full items-center justify-center rounded-lg text-blue-600 font-medium border-blue-500 hover:bg-blue-500 hover:text-white active:bg-blue-600 transition-colors duration-100"
                onClick={(e) =>
                  setRequestData((prev) => ({ ...prev, fund_amount: 100000 }))
                }
              >
                Rp100.000
              </button>
            </div>
          </section>

          <section className="flex flex-col gap-2">
            <label
              htmlFor="donation-amount"
              className="flex flex-col gap-2 text-gray-600"
            >
              <span className="font-bold hover:cursor-pointer">
                Or Enter Custom Amount
              </span>
              <div className="flex flex-row gap-1 border py-3 px-3 rounded-lg">
                <p className="font-bold">Rp</p>
                <input
                  type="text"
                  name="donation-amount"
                  id="donation-amount"
                  value={
                    requestData.fund_amount
                      ? formatPrice(requestData.fund_amount)
                      : "0"
                  }
                  onChange={(e) => {
                    const rawValue = e.target.value.replace(/\D/g, "");
                    setRequestData((prev) => ({
                      ...prev,
                      fund_amount: Number(rawValue || 0),
                    }));
                  }}
                  className="outline-none font-medium"
                />
              </div>
              {requestData.fund_amount < 5000 && (
                <p className="text-red-500 text-sm">
                  Donation below Rp5.000 is unavailable
                </p>
              )}
            </label>
          </section>

          <button
            className={`py-3 h-full rounded font-bold transition-colors duration-100
              ${
                requestData.fund_amount > 5000
                  ? "text-white bg-pink-500 cursor-pointer active:bg-pink-600"
                  : "text-gray-600 bg-slate-300 cursor-not-allowed"
              }`}
            disabled={requestData.fund_amount < 5000}
            onClick={() => {
              handleSubmitDonation();
            }}
          >
            Confirm
          </button>
        </div>
      </DialogHeader>
    </DialogContent>
  );
}
