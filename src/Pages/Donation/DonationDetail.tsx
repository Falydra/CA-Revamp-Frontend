import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import Guest from "@/Layout/GuestLayout";
import type {
  Campaign,
  Fund,
  DonatedBook,
  DonatedItem,
  RequestedSupply,
  User,
  Book,
} from "@/types";
import { apiService } from "@/services/api";
import ProgressBar from "@ramonak/react-progress-bar";
import { CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { toast } from "sonner";

function formatPrice(value: number): string {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export default function CampaignDetail() {
  const { id } = useParams<{ id: string }>();

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [funds, setFunds] = useState<Fund[]>([]);
  const [donatedBooks, setDonatedBooks] = useState<DonatedBook[]>([]);
  const [donatedItems, setDonatedItems] = useState<DonatedItem[]>([]);
  const [requestedSupplies, setRequestedSupplies] = useState<RequestedSupply[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  
  const [paymentModal, setPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [productDonationModal, setProductDonationModal] = useState(false);

  
  const [selectedBooks, setSelectedBooks] = useState<
    { isbn: string; quantity: number }[]
  >([]);
  const [selectedSupplies, setSelectedSupplies] = useState<
    { requested_supply_id: string; quantity: number }[]
  >([]);
  const [donorName, setDonorName] = useState("");

  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const amount = [10000, 25000, 50000, 75000, 100000, 125000, 150000, 200000];

  useEffect(() => {
    const fetchCampaignData = async () => {
      if (!id) return;

      try {
        setLoading(true);

        
        const campaignResponse = await apiService.getCampaign(id);
        if (campaignResponse.data?.success && campaignResponse.data.data) {
          const campaignData = campaignResponse.data.data;
          setCampaign(campaignData);

          
          if (campaignData.type === "fundraiser") {
            try {
              const fundsResponse = await apiService.getFunds(id);
              if (fundsResponse.data?.success) {
                setFunds(fundsResponse.data.data || []);
              }
            } catch (err) {
              console.log("Could not fetch funds:", err);
              setFunds([]);
            }
          } else if (campaignData.type === "product_donation") {
            
            try {
              const [booksResponse, itemsResponse] = await Promise.all([
                apiService.getDonatedBooks(id),
                apiService.getDonatedItems(id),
              ]);

              if (booksResponse.data?.success) {
                setDonatedBooks(booksResponse.data.data || []);
              }
              if (itemsResponse.data?.success) {
                setDonatedItems(itemsResponse.data.data || []);
              }
            } catch (err) {
              console.log("Could not fetch donated items:", err);
            }

            
            try {
              const [suppliesResponse, campaignBooksResponse] = await Promise.all([
                apiService.getRequestedSupplies(id),
                apiService.getRequestedBooks(id),
              ]);

              if (suppliesResponse.data?.success) {
                setRequestedSupplies(suppliesResponse.data.data || []);
              }
              if (campaignBooksResponse.data?.success) {
                setBooks(campaignBooksResponse.data.data || []);
              }
            } catch (err) {
              console.log("Could not fetch requested items:", err);
            }
          }
        }
      } catch (err) {
        console.error("Error fetching campaign data:", err);
        setError("Failed to load campaign details");
      } finally {
        setLoading(false);
      }
    };

    fetchCampaignData();
  }, [id]);

  useEffect(() => {
    
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  useEffect(() => {
    
    if (!campaign?.attributes?.header_image_url) return;

    intervalRef.current = setInterval(() => {
      setCurrentImageIdx((idx) => (idx + 1) % 1); 
    }, 3000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [campaign?.attributes?.header_image_url]);

  const handleBookSelection = (book: Book, checked: boolean) => {
    if (checked) {
      setSelectedBooks((prev) => [...prev, { isbn: book.isbn, quantity: 1 }]);
    } else {
      setSelectedBooks((prev) => prev.filter((b) => b.isbn !== book.isbn));
    }
  };

  const handleSupplySelection = (supply: RequestedSupply, checked: boolean) => {
    if (checked) {
      setSelectedSupplies((prev) => [
        ...prev,
        { requested_supply_id: supply.requested_supply_id, quantity: 1 },
      ]);
    } else {
      setSelectedSupplies((prev) =>
        prev.filter((s) => s.requested_supply_id !== supply.requested_supply_id)
      );
    }
  };

  const handleQuantityChange = (
    isbn: string,
    delta: number,
    type: "book" | "supply"
  ) => {
    if (type === "book") {
      setSelectedBooks((prev) =>
        prev.map((book) =>
          book.isbn === isbn
            ? { ...book, quantity: Math.max(1, book.quantity + delta) }
            : book
        )
      );
    } else {
      setSelectedSupplies((prev) =>
        prev.map((supply) =>
          supply.requested_supply_id === isbn
            ? { ...supply, quantity: Math.max(1, supply.quantity + delta) }
            : supply
        )
      );
    }
  };

  const handleFundDonation = async () => {
    if (!campaign || !user || paymentAmount <= 0) {
      toast.error("Please enter a valid donation amount");
      return;
    }

    try {
      const payload = {
        campaign_id: campaign.campaign_id,
        donor_id: user.user_id,
        amount: paymentAmount,
        status: "pending",
      };

      const response = await apiService.createFund(payload);

      if (response.data?.success) {
        toast.success("Donation submitted successfully!");
        setPaymentModal(false);
        setPaymentAmount(0);
        
        window.location.reload();
      } else {
        toast.error("Failed to submit donation");
      }
    } catch (error) {
      console.error("Donation error:", error);
      toast.error("Failed to submit donation");
    }
  };

  const handleProductDonation = async () => {
    if (!campaign || !user) {
      toast.error("Please login to donate");
      return;
    }

    if (selectedBooks.length === 0 && selectedSupplies.length === 0) {
      toast.error("Please select items to donate");
      return;
    }

    try {
      const promises = [];

      
      for (const bookSelection of selectedBooks) {
        const payload = {
          campaign_id: campaign.campaign_id,
          book_isbn: bookSelection.isbn,
          donor_id: user.user_id,
          donor_name: donorName || user.name,
          quantity: bookSelection.quantity,
          status: "pending",
        };

        promises.push(apiService.createDonatedBook(payload));
      }

      
      for (const supplySelection of selectedSupplies) {
        const payload = {
          campaign_id: campaign.campaign_id,
          requested_supply_id: supplySelection.requested_supply_id,
          donor_id: user.user_id,
          donor_name: donorName || user.name,
          quantity: supplySelection.quantity,
          status: "pending",
        };

        promises.push(apiService.createDonatedItem(payload));
      }

      await Promise.all(promises);

      toast.success("Product donation submitted successfully!");
      setProductDonationModal(false);
      setSelectedBooks([]);
      setSelectedSupplies([]);
      setDonorName("");
      
      window.location.reload();
    } catch (error) {
      console.error("Product donation error:", error);
      toast.error("Failed to submit product donation");
    }
  };

  if (loading) {
    return (
      <Guest>
        <div className="pt-[60px] w-full flex flex-col items-center justify-center min-h-[400px]">
          <div className="text-lg">Loading campaign details...</div>
        </div>
      </Guest>
    );
  }

  if (error || !campaign) {
    return (
      <Guest>
        <div className="pt-[60px] w-full flex flex-col items-center justify-center min-h-[400px]">
          <div className="text-lg text-red-500">
            {error || "Campaign not found"}
          </div>
          <Link to="/campaigns" className="mt-4 text-blue-500 underline">
            Back to Campaigns
          </Link>
        </div>
      </Guest>
    );
  }

  const progressPercentage =
    campaign.type === "fundraiser"
      ? campaign.attributes.requested_fund_amount > 0
        ? Math.min(
            (campaign.attributes.donated_fund_amount / campaign.attributes.requested_fund_amount) * 100,
            100
          )
        : 0
      : campaign.attributes.requested_item_quantity > 0
      ? Math.min(
          (campaign.attributes.donated_item_quantity / campaign.attributes.requested_item_quantity) * 100,
          100
        )
      : 0;

  return (
    <Guest>
      <div className="w-full flex flex-col flex-grow gap-4 items-start px-8 pt-12 pb-8 justify-start bg-primary-bg">
        {campaign.type === "fundraiser" ? (
          <h1 className="text-2xl font-bold text-white">
            Rincian Penggalangan Dana
          </h1>
        ) : (
          <h1 className="text-2xl font-bold text-white">
            Rincian Donasi Produk
          </h1>
        )}

        <div className="flex flex-row gap-6 w-full h-full justify-start items-start">
          <div className="flex flex-col gap-4 w-9/12 h-full justify-start items-start">
            <div className="w-full h-96 bg-gray-300 rounded-lg">
              <img
                src={
                  campaign.attributes.header_image_url
                    ? campaign.attributes.header_image_url.startsWith("/storage/")
                      ? `http://localhost:8000${campaign.attributes.header_image_url}`
                      : `http://localhost:8000/storage/${campaign.attributes.header_image_url}`
                    : "/images/Charity1.jpeg"
                }
                className="w-full h-full rounded-lg object-cover"
                alt={campaign.attributes.title}
                onError={(e) => {
                  e.currentTarget.src = "/images/Charity1.jpeg";
                }}
              />
            </div>

            <h1 className="text-primary-fg w-full text-3xl font-semibold">
              {campaign.attributes.title}
            </h1>

            <div className="flex flex-row gap-4">
              <img
                src="https://cdn-icons-png.flaticon.com/128/3408/3408590.png"
                className="w-12 h-12 p-1 aspect-square bg-slate-300 rounded-full"
                alt=""
              />
              <h3 className="text-primary-fg w-full my-auto font-semibold">
                {campaign.relationships?.organizer?.attriutes?.name ||
                  campaign.relationships?.organizer?.name ||
                  "Anonymous"}
              </h3>
            </div>

            <div className="w-full flex flex-col">
              <p className="text-primary-fg text-sm font-normal text-justify">
                {campaign.attributes.description}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4 w-3/12 h-fit max-h-screen justify-start items-start">
            {campaign.type === "product_donation" && (
              <div className="flex flex-col p-4 gap-4 w-full h-fit border border-primary-fg rounded-md justify-start place-items-start">
                <h2 className="font-semibold text-xl text-center text-white">
                  Produk yang Dibutuhkan
                </h2>

                {books.map((book) => (
                  <div
                    className="flex flex-row w-full items-center"
                    key={book.isbn}
                  >
                    <label
                      htmlFor={book.isbn}
                      className="flex flex-row gap-2 cursor-pointer select-none justify-center items-center"
                    >
                      <input
                        type="checkbox"
                        name={book.isbn}
                        id={book.isbn}
                        checked={selectedBooks.some(
                          (b) => b.isbn === book.isbn
                        )}
                        onChange={(e) =>
                          handleBookSelection(book, e.target.checked)
                        }
                      />
                      <div className="flex flex-col">
                        <p className="text-white">{book.title}</p>
                        <p className="text-xs text-gray-300">
                          {book.author_1}, {book.published_year}
                        </p>
                      </div>
                    </label>
                    {selectedBooks.some((b) => b.isbn === book.isbn) && (
                      <div className="flex flex-row h-8 ml-auto justify-center items-center gap-1">
                        <button
                          onClick={() =>
                            handleQuantityChange(book.isbn, -1, "book")
                          }
                          className="text-white"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="size-4"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 12h14"
                            />
                          </svg>
                        </button>
                        <input
                          type="number"
                          className="max-w-6 m-2 bg-transparent border-b border-primary-fg text-center text-white"
                          value={
                            selectedBooks.find((b) => b.isbn === book.isbn)
                              ?.quantity ?? 1
                          }
                          disabled
                        />
                        <button
                          onClick={() =>
                            handleQuantityChange(book.isbn, 1, "book")
                          }
                          className="text-white"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="size-4"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 4.5v15m7.5-7.5h-15"
                            />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                ))}

                {requestedSupplies.map((supply) => (
                  <div
                    className="flex flex-row w-full items-center"
                    key={supply.requested_supply_id}
                  >
                    <label
                      htmlFor={supply.requested_supply_id}
                      className="flex flex-row gap-2 cursor-pointer select-none justify-center items-center"
                    >
                      <input
                        type="checkbox"
                        name={supply.requested_supply_id}
                        id={supply.requested_supply_id}
                        checked={selectedSupplies.some(
                          (s) =>
                            s.requested_supply_id === supply.requested_supply_id
                        )}
                        onChange={(e) =>
                          handleSupplySelection(supply, e.target.checked)
                        }
                      />
                      <div className="flex flex-col">
                        <p className="text-white">{supply.name}</p>
                        <p className="text-xs text-gray-300">
                          {supply.description} | {supply.unit}
                        </p>
                        <p className="text-xs text-gray-300">
                          Tersisa:{" "}
                          {supply.quantity_needed - supply.quantity_received}
                        </p>
                      </div>
                    </label>
                    {selectedSupplies.some(
                      (s) =>
                        s.requested_supply_id === supply.requested_supply_id
                    ) && (
                      <div className="flex flex-row h-8 ml-auto justify-center items-center gap-1">
                        <button
                          onClick={() =>
                            handleQuantityChange(
                              supply.requested_supply_id,
                              -1,
                              "supply"
                            )
                          }
                          className="text-white"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="size-4"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 12h14"
                            />
                          </svg>
                        </button>
                        <input
                          type="number"
                          className="max-w-6 m-2 bg-transparent border-b border-primary-fg text-center text-white"
                          value={
                            selectedSupplies.find(
                              (s) =>
                                s.requested_supply_id ===
                                supply.requested_supply_id
                            )?.quantity ?? 1
                          }
                          disabled
                        />
                        <button
                          onClick={() =>
                            handleQuantityChange(
                              supply.requested_supply_id,
                              1,
                              "supply"
                            )
                          }
                          className="text-white"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="size-4"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 4.5v15m7.5-7.5h-15"
                            />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                ))}

                {(selectedBooks.length > 0 || selectedSupplies.length > 0) && (
                  <Button
                    className="w-full h-10 disabled:bg-primary-fg/50 select-none bg-primary-accent hover:bg-primary-accent/50 cursor-pointer"
                    onClick={() => setProductDonationModal(true)}
                    disabled={campaign.attributes.status === "finished"}
                  >
                    Donasi Sekarang
                  </Button>
                )}
              </div>
            )}

            <div className="flex flex-col border border-primary-fg p-4 gap-4 rounded-md w-full h-full justify-start items-start">
              <ProgressBar
                className="w-full"
                labelAlignment="outside"
                isLabelVisible={false}
                completed={progressPercentage}
                maxCompleted={100}
              />
              <h1 className="font-thin text-xs text-center text-white">
                Terkumpul
              </h1>
              <h2 className="font-thin text-sm text-center text-primary-accent">
                {campaign.type === "fundraiser"
                  ? `Rp ${formatPrice(
                      campaign.attributes.donated_fund_amount
                    )} / Rp ${formatPrice(campaign.attributes.requested_fund_amount)}`
                  : `${campaign.attributes.donated_item_quantity} / ${campaign.attributes.requested_item_quantity} Produk`}
              </h2>

              <div className="flex flex-row w-full py-4 items-center rounded-md hover:bg-primary-accent/50 h-1/6 border-b border-primary-fg/15 cursor-pointer">
                <CardTitle className="text-white">Donasi Terbaru</CardTitle>
                <div className="ml-4 bg-primary-accent text-white rounded-full px-4 py-1 text-xs font-semibold shadow">
                  {funds.length + donatedBooks.length + donatedItems.length}{" "}
                  donasi
                </div>
              </div>

              <div className="w-full flex flex-col h-full items-start justify-start gap-y-8">
                <div className="flex flex-col h-3/6 gap-y-4 w-full justify-between">
                  <div className="w-full flex flex-col py-4 gap-4 shadow-sm rounded-md shadow-primary-fg h-full overflow-y-auto">
                    <div className="w-full flex flex-col gap-4">
                      {funds.slice(0, 5).map((fund, idx) => (
                        <div
                          key={idx}
                          className="w-full h-[55px] py-2 hover:bg-primary-accent flex rounded-md cursor-pointer items-center flex-row gap-4 justify-start px-2"
                        >
                          <div className="w-10 h-10 flex items-center aspect-square justify-center rounded-full bg-primary-fg cursor-pointer text-primary-fg">
                            {fund.donor?.name?.charAt(0) ||
                              fund.donor_name?.charAt(0) ||
                              "A"}
                          </div>
                          <div className="w-full flex-col items-start justify-center flex">
                            <h1 className="text-md font-semibold text-white">
                              {fund.donor?.name || fund.donor_name || "Anonim"}
                            </h1>
                            <h3 className="text-sm text-muted-foreground">
                              Rp {formatPrice(fund.amount)}
                            </h3>
                          </div>
                        </div>
                      ))}

                      {/* Display recent book donations */}
                      {donatedBooks.slice(0, 3).map((donation, idx) => (
                        <div
                          key={idx}
                          className="w-full h-[55px] py-2 hover:bg-primary-accent flex rounded-md cursor-pointer items-center flex-row gap-4 justify-start px-2"
                        >
                          <div className="w-10 h-10 flex items-center aspect-square justify-center rounded-full bg-primary-fg cursor-pointer text-primary-fg">
                            {donation.donor?.name?.charAt(0) ||
                              donation.donor_name?.charAt(0) ||
                              "A"}
                          </div>
                          <div className="w-full flex-col items-start justify-center flex">
                            <h1 className="text-md font-semibold text-white">
                              {donation.donor?.name ||
                                donation.donor_name ||
                                "Anonim"}
                            </h1>
                            <h3 className="text-sm text-muted-foreground">
                              {donation.quantity} buku
                            </h3>
                          </div>
                        </div>
                      ))}

                      {/* Display recent item donations */}
                      {donatedItems.slice(0, 3).map((donation, idx) => (
                        <div
                          key={idx}
                          className="w-full h-[55px] py-2 hover:bg-primary-accent flex rounded-md cursor-pointer items-center flex-row gap-4 justify-start px-2"
                        >
                          <div className="w-10 h-10 flex items-center aspect-square justify-center rounded-full bg-primary-fg cursor-pointer text-primary-fg">
                            {donation.donor?.name?.charAt(0) ||
                              donation.donor_name?.charAt(0) ||
                              "A"}
                          </div>
                          <div className="w-full flex-col items-start justify-center flex">
                            <h1 className="text-md font-semibold text-white">
                              {donation.donor?.name ||
                                donation.donor_name ||
                                "Anonim"}
                            </h1>
                            <h3 className="text-sm text-muted-foreground">
                              {donation.quantity}{" "}
                              {donation.requested_supply?.name || "item"}
                            </h3>
                          </div>
                        </div>
                      ))}

                      {funds.length === 0 &&
                        donatedBooks.length === 0 &&
                        donatedItems.length === 0 && (
                          <div className="text-sm text-muted-foreground px-2">
                            Belum ada donasi.
                          </div>
                        )}
                    </div>
                  </div>
                </div>

                {campaign.type === "fundraiser" && (
                  <Button
                    className="w-full h-10 disabled:bg-primary-fg/50 select-none bg-primary-accent hover:bg-primary-accent/50 cursor-pointer"
                    onClick={() => setPaymentModal(true)}
                    disabled={campaign.attributes.status === "finished"}
                  >
                    Donasi Sekarang
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Product Donation Modal */}
        {productDonationModal && user && (
          <div className="fixed z-50 backdrop-blur-md inset-0 bg-black bg-opacity-50 flex text-primary-bg items-center justify-center">
            <div className="bg-white w-1/3 h-fit rounded-xl flex flex-col p-4 overflow-y-auto">
              <div className="w-full flex flex-col gap-4">
                <h2 className="text-lg font-bold">Konfirmasi Donasi Produk</h2>

                <label>
                  Nama Donatur (Opsional)
                  <input
                    type="text"
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    placeholder={user.name}
                    className="w-full p-2 border rounded-md border-primary-bg"
                  />
                </label>

                <div className="text-sm">
                  <h3 className="font-semibold">Ringkasan Donasi:</h3>
                  {selectedBooks.map((book) => {
                    const bookInfo = books.find((b) => b.isbn === book.isbn);
                    return (
                      <p key={book.isbn}>
                        • {bookInfo?.title} (Qty: {book.quantity})
                      </p>
                    );
                  })}
                  {selectedSupplies.map((supply) => {
                    const supplyInfo = requestedSupplies.find(
                      (s) =>
                        s.requested_supply_id === supply.requested_supply_id
                    );
                    return (
                      <p key={supply.requested_supply_id}>
                        • {supplyInfo?.name} (Qty: {supply.quantity})
                      </p>
                    );
                  })}
                </div>

                <button
                  className="bg-primary-accent text-white px-4 py-2 rounded-md transition-shadow duration-200 shadow hover:shadow-[0_0_16px_4px_rgba(37,99,235,0.5)]"
                  onClick={handleProductDonation}
                >
                  Konfirmasi Donasi
                </button>
                <button
                  onClick={() => setProductDonationModal(false)}
                  className="bg-primary-bg text-primary-fg hover:text-primary-bg px-4 py-2 rounded transition-colors duration-300 hover:bg-transparent hover:border hover:border-primary-bg"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Fund Donation Modal */}
        {paymentModal && user && (
          <div className="fixed z-50 inset-0 bg-black backdrop-blur-md bg-opacity-50 flex text-primary-bg items-center justify-center">
            <div className="bg-white w-1/3 h-5/6 rounded-xl flex flex-col">
              <div className="w-full h-full flex flex-col p-4 overflow-y-auto">
                <h1 className="text-xl font-bold">Pilih Nominal Donasi</h1>
                <div className="relative w-full border flex rounded-md border-b-0 rounded-b-none border-primary-bg">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                    Rp.
                  </span>
                  <input
                    placeholder="0"
                    type="number"
                    className="w-full h-[50px] pl-10 text-primary-bg rounded-md"
                    value={paymentAmount || ""}
                    onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  />
                </div>

                <div className="w-full py-4 grid grid-cols-3 gap-4">
                  {amount.map((nominal, index) => (
                    <Button
                      key={index}
                      className="text-primary-bg hover:bg-primary-fg bg-muted-foreground/50"
                      onClick={() => setPaymentAmount(nominal)}
                    >
                      Rp {nominal.toLocaleString("id-ID")}
                    </Button>
                  ))}
                </div>

                <h1 className="text-xl font-bold self-start">Detail Donasi</h1>
                <div className="w-full h-[75px] flex rounded-xl items-center flex-row gap-4 justify-start">
                  <div className="w-12 h-12 flex items-center aspect-square justify-center rounded-full bg-primary-accent cursor-pointer text-white">
                    {campaign.relationships?.organizer?.attriutes?.name?.charAt(0) ||
                      campaign.relationships?.organizer?.name?.charAt(0) ||
                      "O"}
                  </div>
                  <div className="w-full flex-col items-start justify-center flex">
                    <h1 className="text-lg font-bold">{campaign.attributes.title}</h1>
                    <h1 className="text-sm font-semibold">
                      {campaign.relationships?.organizer?.attriutes?.name ||
                        campaign.relationships?.organizer?.name ||
                        "Anonymous"}
                    </h1>
                  </div>
                </div>

                <div className="mt-auto flex flex-col items-center justify-between gap-1">
                  <Button
                    className="hover:bg-primary-fg bg-primary-accent w-full"
                    onClick={handleFundDonation}
                    disabled={!paymentAmount || paymentAmount <= 0}
                  >
                    Donasi Rp {formatPrice(paymentAmount)}
                  </Button>
                  <Button
                    className="hover:bg-primary-fg bg-primary-bg w-full"
                    onClick={() => setPaymentModal(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Guest>
  );
}