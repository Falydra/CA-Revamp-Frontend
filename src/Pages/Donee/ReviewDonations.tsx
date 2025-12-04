import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import DoneeLayout from "@/Layout/AuthenticatedLayout";
import { apiService } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";
import { MoreHorizontal, Check, Truck, X, Ban } from "lucide-react";

export default function ReviewDonations() {
  const { campaignSlug } = useParams();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetch = async () => {
      if (!campaignSlug) {
        console.log("No campaign slug provided");
        setLoading(false);
        return;
      }
      
      setLoading(true);
      console.log("Campaign slug from URL:", campaignSlug);
      
      try {
        console.log("Fetching donated items directly for campaign:", campaignSlug);
        
        // Use the direct campaign items endpoint
        const resp = await apiService.getCampaignDonatedItems(campaignSlug as string);
        console.log("Items API response:", resp);
        
        // normalize possible shapes
        let list: any[] = [];
        if (Array.isArray(resp?.data)) {
          list = resp.data;
        } else if (Array.isArray(resp?.data?.data)) {
          list = resp.data.data;
        } else if (Array.isArray(resp)) {
          list = resp;
        }

        console.log("Parsed items list:", list);
        console.log("Total items count:", list.length);
        setItems(list);
      } catch (err: any) {
        console.error("Failed to fetch donated items:", err);
        console.error("Error response:", err?.response?.data);
        console.error("Error status:", err?.response?.status);
        toast.error("Failed to load donated items");
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [campaignSlug, refreshKey]);

  const getAttr = (item: any, key: string) => {
    return item.attributes?.[key] ?? item[key] ?? null;
  };

  const handleVerify = async (id: string) => {
    try {
      await apiService.verifyDonatedItem(id);
      toast.success("Donated item marked as On Delivery");
      setRefreshKey((k) => k + 1);
    } catch (err) {
      console.error("Verify error:", err);
      toast.error("Failed to verify donated item");
    }
  };

  const handleMarkReceived = async (id: string) => {
    try {
      await apiService.updateDonatedItemStatus(id, "received");
      toast.success("Donated item marked as Received and campaign totals updated");
      setRefreshKey((k) => k + 1);
    } catch (err) {
      console.error("Mark received error:", err);
      toast.error("Failed to mark donated item as received");
    }
  };

  const handleMarkNotReceived = async (id: string) => {
    if (!confirm("Mark this item as Not Received?")) return;
    try {
      await apiService.updateDonatedItemStatus(id, "not_received");
      toast.success("Donated item marked as Not Received");
      setRefreshKey((k) => k + 1);
    } catch (err) {
      console.error("Mark not received error:", err);
      toast.error("Failed to mark donated item as not received");
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm("Cancel this donated item?")) return;
    try {
      await apiService.updateDonatedItemStatus(id, "cancelled");
      toast.success("Donated item cancelled");
      setRefreshKey((k) => k + 1);
    } catch (err) {
      console.error("Cancel error:", err);
      toast.error("Failed to cancel donated item");
    }
  };

  const handleDecline = async (id: string) => {
    if (!confirm("Decline this donated item?")) return;
    try {
      await apiService.updateDonatedItemStatus(id, "declined");
      toast.success("Donated item declined");
      setRefreshKey((k) => k + 1);
    } catch (err) {
      console.error("Decline error:", err);
      toast.error("Failed to decline donated item");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending_verification":
        return "bg-yellow-100 text-yellow-800";
      case "on_delivery":
        return "bg-indigo-100 text-indigo-800";
      case "received":
        return "bg-green-100 text-green-800";
      case "not_received":
      case "cancelled":
      case "declined":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <DoneeLayout>
      <div className="space-y-6 p-4 w-full">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Review Donated Items</h1>
            <p className="text-muted-foreground">Review donated packages for this campaign and mark them as received.</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Donated Items</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div>Loading donated items...</div>
            ) : items.length === 0 ? (
              <div>No donated items found for this campaign.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm table-auto">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="p-2">#</th>
                      <th className="p-2">Donated Item ID</th>
                      <th className="p-2">Donation ID</th>
                      <th className="p-2">Quantity</th>
                      <th className="p-2">Package</th>
                      <th className="p-2">Delivery</th>
                      <th className="p-2">Resi</th>
                      <th className="p-2">Status</th>
                      <th className="p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, idx) => {
                      const id = item.id ?? item.donated_item_id ?? null;
                      const donationId = item.donation_id ?? getAttr(item, 'donation_id') ?? null;
                      const quantity = getAttr(item, 'quantity');
                      const packageUrl = getAttr(item, 'package_picture_url');
                      const delivery = getAttr(item, 'delivery_service');
                      const resi = getAttr(item, 'resi');
                      const status = getAttr(item, 'status') ?? item.status ?? 'pending_verification';
                      const created = getAttr(item, 'created_at') ?? item.created_at ?? null;

                      return (
                        <tr key={id || idx} className="border-b">
                          <td className="p-2 align-top">{idx + 1}</td>
                          <td className="p-2 align-top">{id}</td>
                          <td className="p-2 align-top">{donationId}</td>
                          <td className="p-2 align-top">{quantity}</td>
                          <td className="p-2 align-top">
                            {packageUrl ? (
                              // eslint-disable-next-line jsx-a11y/img-redundant-alt
                              <img src={packageUrl} alt="package" className="h-20 w-20 object-cover rounded" />
                            ) : (
                              <div className="text-sm text-muted-foreground">No picture</div>
                            )}
                          </td>
                          <td className="p-2 align-top">{delivery}</td>
                          <td className="p-2 align-top">{resi}</td>
                          <td className="p-2 align-top">
                            <Badge className={getStatusColor(status)}>{status}</Badge>
                          </td>
                          <td className="p-2 align-top">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {status === 'pending_verification' && (
                                  <>
                                    <DropdownMenuItem onClick={() => handleVerify(id)} className="cursor-pointer">
                                      <Truck className="mr-2 h-4 w-4" />
                                      Verify (On Delivery)
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleDecline(id)} className="text-red-600 cursor-pointer">
                                      <Ban className="mr-2 h-4 w-4" />
                                      Decline
                                    </DropdownMenuItem>
                                  </>
                                )}

                                {status === 'on_delivery' && (
                                  <>
                                    <DropdownMenuItem onClick={() => handleMarkReceived(id)} className="cursor-pointer">
                                      <Check className="mr-2 h-4 w-4" />
                                      Mark Received
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleMarkNotReceived(id)} className="text-red-600 cursor-pointer">
                                      <X className="mr-2 h-4 w-4" />
                                      Mark Not Received
                                    </DropdownMenuItem>
                                  </>
                                )}

                                {(status === 'pending_verification' || status === 'on_delivery') && (
                                  <DropdownMenuItem onClick={() => handleCancel(id)} className="text-red-600 cursor-pointer">
                                    <X className="mr-2 h-4 w-4" />
                                    Cancel
                                  </DropdownMenuItem>
                                )}

                                {status === 'received' && (
                                  <DropdownMenuItem disabled>
                                    <Check className="mr-2 h-4 w-4" />
                                    Already Received
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DoneeLayout>
  );
}
