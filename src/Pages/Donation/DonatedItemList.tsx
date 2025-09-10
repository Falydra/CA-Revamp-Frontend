import  { useState, useEffect } from "react";
import type { DonatedBook, DonatedItem, Fund } from "@/types";
import { apiService } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { toast } from "sonner";

interface DonatedItemListProps {
    campaignId: string;
    campaignType: "fundraiser" | "product_donation";
}

export default function DonatedItemList({ campaignId, campaignType }: DonatedItemListProps) {
    const [funds, setFunds] = useState<Fund[]>([]);
    const [donatedBooks, setDonatedBooks] = useState<DonatedBook[]>([]);
    const [donatedItems, setDonatedItems] = useState<DonatedItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDonations = async () => {
            try {
                setLoading(true);

                if (campaignType === "fundraiser") {
                    const response = await apiService.getFunds(campaignId);
                    if (response.data?.success) {
                        setFunds(response.data.data || []);
                    }
                } else {
                    const [booksResponse, itemsResponse] = await Promise.all([
                        apiService.getDonatedBooks(campaignId),
                        apiService.getDonatedItems(campaignId),
                    ]);

                    if (booksResponse.data?.success) {
                        setDonatedBooks(booksResponse.data.data || []);
                    }
                    if (itemsResponse.data?.success) {
                        setDonatedItems(itemsResponse.data.data || []);
                    }
                }
            } catch (error) {
                console.error("Error fetching donations:", error);
                toast.error("Failed to load donations");
            } finally {
                setLoading(false);
            }
        };

        fetchDonations();
    }, [campaignId, campaignType]);

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'verified':
            case 'approved':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const formatPrice = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
        }).format(amount);
    };

    if (loading) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="text-center">Loading donations...</div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    {campaignType === "fundraiser" ? "Donasi Dana" : "Donasi Produk"}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {campaignType === "fundraiser" ? (
                        funds.length > 0 ? (
                            funds.map((fund) => (
                                <div
                                    key={fund.fund_id}
                                    className="flex items-center justify-between p-4 border rounded-lg"
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                            <span className="text-blue-600 font-semibold">
                                                {(fund.donor?.name || fund.donor_name || "Anonymous").charAt(0)}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="font-semibold">
                                                {fund.donor?.name || fund.donor_name || "Anonymous"}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {formatPrice(fund.amount)}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {fund.created_at
                                                    ? new Date(fund.created_at).toLocaleDateString('id-ID')
                                                    : 'Unknown date'
                                                }
                                            </p>
                                        </div>
                                    </div>
                                    <Badge className={getStatusColor(fund.status)}>
                                        {fund.status}
                                    </Badge>
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-gray-500 py-8">
                                Belum ada donasi dana
                            </div>
                        )
                    ) : (
                        <>
                            {donatedBooks.length > 0 && (
                                <div>
                                    <h4 className="font-semibold mb-2">Donasi Buku</h4>
                                    {donatedBooks.map((donation) => (
                                        <div
                                            key={donation.donated_book_id}
                                            className="flex items-center justify-between p-4 border rounded-lg mb-2"
                                        >
                                            <div className="flex items-center space-x-4">
                                                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                                    <span className="text-green-600 font-semibold">
                                                        {(donation.donor?.name || donation.donor_name || "Anonymous").charAt(0)}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="font-semibold">
                                                        {donation.donor?.name || donation.donor_name || "Anonymous"}
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        {donation.book?.title || "Unknown Book"}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        Qty: {donation.quantity} | {donation.created_at
                                                            ? new Date(donation.created_at).toLocaleDateString('id-ID')
                                                            : 'Unknown date'
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                            <Badge className={getStatusColor(donation.status)}>
                                                {donation.status}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {donatedItems.length > 0 && (
                                <div>
                                    <h4 className="font-semibold mb-2">Donasi Barang</h4>
                                    {donatedItems.map((donation) => (
                                        <div
                                            key={donation.donated_item_id}
                                            className="flex items-center justify-between p-4 border rounded-lg mb-2"
                                        >
                                            <div className="flex items-center space-x-4">
                                                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                                    <span className="text-purple-600 font-semibold">
                                                        {(donation.donor?.name || donation.donor_name || "Anonymous").charAt(0)}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="font-semibold">
                                                        {donation.donor?.name || donation.donor_name || "Anonymous"}
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        {donation.requested_supply?.name || "Unknown Item"}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        Qty: {donation.quantity} | {donation.created_at
                                                            ? new Date(donation.created_at).toLocaleDateString('id-ID')
                                                            : 'Unknown date'
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                            <Badge className={getStatusColor(donation.status)}>
                                                {donation.status}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {donatedBooks.length === 0 && donatedItems.length === 0 && (
                                <div className="text-center text-gray-500 py-8">
                                    Belum ada donasi produk
                                </div>
                            )}
                        </>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}