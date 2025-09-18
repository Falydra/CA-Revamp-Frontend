import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import type { Campaign, Organizer, FundSummary, RequestedBook, RequestedSupply, DonatedItemSummary } from "@/types";
import { apiService } from "@/services/api";
import Guest from "@/Layout/GuestLayout";
import ProgressBar from "@/Components/ui/progress-bar";
import { Share2Icon } from "lucide-react";
import { toast } from "sonner";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/Components/ui/accordion";
import { Dialog, DialogTrigger } from "@/Components/ui/dialog";
import DonateFundForm from "@/Components/DonateFundForm";
import DonationHistoryItem from "@/Components/DonationHistoryItem";
import DonateItemForm from "@/Components/DonateItemForm";
import RequestedItem from "@/Components/RequestedItem";

function formatPrice(value: number): string {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export default function CampaignDetail() {
  const { id } = useParams<{ id: string }>();

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [organizer, setOrganizer] = useState<Organizer | null>(null);
  const [loading, setLoading] = useState(false);

  const [type, setType] = useState("");

  const [requestedBooks, setRequestedBooks] = useState<RequestedBook[]>([]);
  const [requestedSupplies, setRequestedSupplies] = useState<RequestedSupply[]>([]);

  const [fundHistory, setfundHistory] = useState<FundSummary[]>([]);
  const [itemHistory, setItemHistory] = useState<DonatedItemSummary[]>([]);

  const [error, setError] = useState(false);
  const [open, setOpen] = useState(false);

  const fetchCampaignData = async () => {
    if (!id) return;

    try {
      setLoading(true);

      const campaignResponse = await apiService.getCampaign(id);
      if (campaignResponse.status && campaignResponse.status === "success") {
        const campaignData = campaignResponse.data;
        setCampaign(campaignData);
        setOrganizer(campaignData.relationships.organizer);

        setType(campaignData.attributes.campaign_type);

        if (campaignData.attributes.campaign_type === "product_donation") {
          setRequestedBooks(campaignData.relationships.requested_items.books);
          setRequestedSupplies(campaignData.relationships.requested_items.supplies);
        }
      }
    } catch (e) {
      console.log(`[ERROR] - Could not fetch campaign`);
      console.log(`[ERROR] - ${e}`);
    } finally {
      setLoading(false);
    }
  }

  const fetchFundsHistory = async () => {
    if (!id) return;

    try {
      const response = await apiService.getFundsCampaignHistory(
        id, {
        status: "paid"
      }
      );
      if (response) {
        console.log("[API Response] - Donation History: ", response.data);
        setfundHistory(response.data);
      }
    } catch (e) {
      console.log(`[ERROR] - Could not fetch campaign`);
      console.log(`[ERROR] - ${e}`);
    }
  }

  const fetchItemHistory = async () => {
    if (!id) return;

    try {
      const response = await apiService.getItemsCampaignHistory(
        id, {
        status: "received"
      }
      );
      if (response) {
        console.log("[API Response] - Donation History: ", response.data);
        setItemHistory(response.data);
      }
    } catch (e) {
      console.log(`[ERROR] - Could not fetch campaign`);
      console.log(`[ERROR] - ${e}`);
      setError(true);
    }
  }

  const handleCopyUrl = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast("Link copied to clipboard");
  }

  useEffect(() => {
    fetchCampaignData();
    fetchFundsHistory();
    fetchItemHistory();
  }, []);

  if (error || !loading && !campaign) {
    return (
      <Guest>
        <div className="pt-[60px] w-full flex flex-col gap-8 items-center justify-center min-h-[540px]">
          <div className="text-6xl text-blue-500 font-black">
            {"404 - Campaign not found"}
          </div>
          <Link to="/campaigns" className="mt-4 text-blue-500 underline">
            Back to Campaigns
          </Link>
        </div>
      </Guest>
    );
  }

  return (
    <Guest>
      <div className="flex flex-row gap-8 w-full min-h-screen px-20 py-12">
        {/* Main Content */}
        {loading ? (
          <section className="flex flex-col w-3/4 gap-6 animate-pulse">
            <div className="w-full h-96 bg-slate-300 rounded-lg"></div>
            <div className="flex flex-row gap-4 items-center">
              <div className="w-12 h-12 rounded-full bg-slate-300"></div>
              <div className="w-64 h-3 rounded-full bg-slate-300"></div>
            </div>
            <div className="w-96 h-4 rounded-full bg-slate-300"></div>
          </section>
        ) : (
          <section className="flex flex-col w-3/4 gap-6">
            <img
              className="w-full h-96 object-cover rounded-xl"
              src={`${campaign?.attributes.header_image_url}`}
              alt={`Thumbnail of ${campaign?.attributes.title}`} />

            {/* Organizer */}
            <div className="w-fit h-fit flex flex-row gap-4 items-center">
              <img
                className="w-12 h-12 rounded-full shadow-lg"
                src={organizer?.attributes.profile_image_url}>
              </img>
              <p className="font-bold text-gray-600">{organizer?.attributes.name}</p>
            </div>

            {/* Content */}
            <div className="flex flex-col gap-4 w-fit h-fit">
              <h1 className="text-3xl text-gray-700 font-bold">{campaign?.attributes.title}</h1>
              {campaign?.attributes.description.split("\n\n").map((paragraph, i) => (
                <p key={i} className="text-justify">{paragraph}</p>
              ))}
            </div>
          </section>
        )}

        {/* Right Bar */}
        {loading ? (
          <section className="flex flex-col gap-4 py-4 px-6 h-fit w-1/4 border rounded-xl animate-pulse">
            <div className="w-32 h-2 rounded-full bg-slate-300"></div>
            <div className="w-full h-4 rounded-full bg-slate-300"></div>
            <div className="w-full h-2 rounded-full bg-slate-300"></div>
          </section>
        ) : (
          <section className="flex flex-col gap-4 p-6 h-fit max-h-[48rem] w-1/4 min-w-96 border rounded-xl sticky top-20 bg-white">
            {/* Progress */}
            {type === "product_donation" ? (
              <div className="flex flex-col gap-1">
                <p className="text-sm">Raised</p>
                <p className="text-sm">
                  <span className="text-xl text-blue-500 font-bold">{campaign ? campaign.attributes.donated_item_quantity : 0} </span>
                  out of
                  <span className="text-gray-600 font-bold"> {campaign ? campaign.attributes.requested_item_quantity : 0} items</span>
                </p>
                <ProgressBar
                  completed={campaign ? campaign?.attributes.donated_item_quantity : 0}
                  maxCompleted={campaign ? campaign?.attributes.requested_item_quantity : 0}
                  isLabelVisible={false}
                  className="mt-2"
                />
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                <p className="text-sm">Raised</p>
                <p className="text-sm">
                  <span className="text-xl text-blue-500 font-bold">Rp{formatPrice(campaign ? campaign.attributes.donated_fund_amount : 0)},00 </span>
                  of
                  <span className="text-gray-600 font-bold"> Rp{formatPrice(campaign ? campaign.attributes.requested_fund_amount : 0)},00 </span>
                </p>
                <ProgressBar
                  completed={campaign ? campaign?.attributes.donated_fund_amount : 0}
                  maxCompleted={campaign ? campaign?.attributes.requested_fund_amount : 0}
                  isLabelVisible={false}
                  className="mt-2"
                />
              </div>
            )}

            <Accordion type="single" collapsible defaultValue={`${type === "product_donation" ? "item-1" : "item-2"}`}>
              {/* Requested Items */}
              {type === "product_donation" && (
                <AccordionItem value="item-1">
                  <AccordionTrigger className="text-lg">Needed Supplies</AccordionTrigger>
                  <AccordionContent className="AccordionContent">
                    <div className="flex flex-col h-fit max-h-96 overflow-y-scroll scrollbar-hide">
                      {requestedBooks.map((book) => (
                        <RequestedItem
                          type="book"
                          item={book}
                          key={book.id} />
                      ))}
                      {requestedSupplies.map((item) => (
                        <RequestedItem
                          type="supply"
                          item={item}
                          key={item.id} />
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}

              {/* Donors */}
              <AccordionItem value="item-2">
                <AccordionTrigger className="text-lg">Latest Donations</AccordionTrigger>
                <AccordionContent className="AccordionContent">
                  <div className="flex flex-col h-fit max-h-96 overflow-y-auto scrollbar-hide">
                    {type === "fundraiser" &&
                      (fundHistory.length > 0 ? (
                        (fundHistory.map((fund) => (
                          <DonationHistoryItem
                            key={fund.id}
                            type={type}
                            donor={fund.donor}
                            quantity={fund.attributes.amount}
                            date={fund.attributes.updated_at}
                          />
                        )))
                      ) : (
                        <div className="px-2">Be the first to donate!</div>
                      ))
                    }

                    {type === "product_donation" &&
                      (itemHistory.length > 0 ? (
                        (itemHistory.map((item) => (
                          <DonationHistoryItem
                            key={item.id}
                            type={type}
                            donor={item.donor}
                            quantity={item.attributes.quantity}
                            date={item.attributes.updated_at}
                          />
                        )))
                      ) : (
                        <div className="px-2">Be the first to donate!</div>
                      ))
                    }
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Donate Button */}
            <div className="flex flex-row min-h-12 h-12 gap-2">
              <div
                className="select-none flex flex-row gap-2 w-1/3 h-full items-center justify-center rounded border-2 border-blue-500 text-blue-500 font-medium hover:bg-blue-500 hover:text-white transition-colors duration-100 hover:cursor-pointer active:bg-blue-600 active:border-blue-600"
                onClick={() => handleCopyUrl()}>
                <Share2Icon
                  size={16}
                  strokeWidth={3}
                />
                Share
              </div>
              {type === "fundraiser" &&
                <Dialog>
                  <DialogTrigger className="w-2/3 h-full rounded font-medium text-white bg-pink-500 active:bg-pink-600 transition-colors duration-100">
                    Donate Now
                  </DialogTrigger>
                  <DonateFundForm
                    campaign={campaign}
                  />
                </Dialog>
              }
              {type === "product_donation" &&
                <Dialog>
                  <DialogTrigger className="w-2/3 h-full rounded font-medium text-white bg-pink-500 active:bg-pink-600 transition-colors duration-100">
                    Donate Now
                  </DialogTrigger>
                  <DonateItemForm
                    campaign={campaign}
                    requestedBooks={requestedBooks}
                    requestedSupplies={requestedSupplies}
                  />
                </Dialog>
              }
            </div>
          </section>
        )}
      </div>
    </Guest>
  )
}