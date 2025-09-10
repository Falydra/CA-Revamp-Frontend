
import { useState, useEffect } from "react";
import { Button } from "@/Components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/Components/ui/card";
import CharityDetail from "./CharityDetail";

import ProgressBar from "@/Components/ui/progress-bar";
import { Link } from "react-router-dom";

import { IoIosArrowForward } from "react-icons/io";
import initiator_data, { type InitiatorData } from "@/config/initiator_data";


import { Input } from "./ui/input";
import { IoDocumentTextOutline } from "react-icons/io5";
import nominal_donasi, { type NominalDonasi } from "@/config/nominal_donasi";
import { fetchBookDonationData, type DonationData } from "@/data/donationData";


interface TestUser {
  id: number;
  name: string;
  email: string;
}

const testAuth = {
  user: {
    id: 1,
    name: "Jokowi",
    email: "jokowi@example.com",
  } as TestUser,
};

function formatPrice(value: number): string {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export function BookCharityCard() {
  const [bookDonations, setBookDonations] = useState<DonationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalEnableCharity, setIsModalEnableCharity] = useState(false);
  const [isDetail, setIsDetail] = useState(false);
  const [donationAmount, setDonationAmount] = useState("");

  useEffect(() => {
    const loadBookDonations = async () => {
      try {
        setLoading(true);
        const data = await fetchBookDonationData();
        setBookDonations(data);
      } catch (error) {
        console.error("Error fetching book donations:", error);
      } finally {
        setLoading(false);
      }
    };

    loadBookDonations();
  }, []);

  const handleDetail = () => {
    setIsDetail(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-lg">Loading book donations...</div>
      </div>
    );
  }

  return (
    <>
      {bookDonations.map(
        (donation, index) =>
          index < 1 && (
            <Card className="w-9/12 flex flex-col h-full">
              <div className="flex flex-row w-full h-full ">
                <div className="w-6/12 h-full justify-between items-start flex flex-col cursor-pointer hover:text-primary-bg hover:rounded-l-xl">
                  <CardHeader className="text-start text-xl">
                    <CardTitle>{donation.title}</CardTitle>
                    <CardDescription>
                      {donation.text_descriptions[0]
                        ?.split(" ")
                        .slice(0, 75)
                        .join(" ") +
                        (donation.text_descriptions[0]?.split(" ").length > 75
                          ? "..."
                          : "")}
                    </CardDescription>
                    <div className="w-full flex flex-row items-center justify-between">
                      <h2 className="text-sm font-semibold">
                        <span className="text-black">Jenis Buku:</span>{" "}
                        <span className="text-primary-accent">Kalkulus</span>
                      </h2>
                      <a
                        className="text-primary-accent hover:text-primary-bg/70 font-semibold text-sm flex flex-row self-end"
                        onClick={handleDetail}
                      >
                        Detail
                        <IoIosArrowForward className="text-md self-center" />
                      </a>
                    </div>
                  </CardHeader>

                  <CardFooter className="flex w-full justify-end h-full flex-col ">
                    <div className="w-full flex flex-col items-start justify-end h-full">
                      <h1 className="text-xl font-bold">Tersedia</h1>

                      <ProgressBar
                        className="w-full"
                        labelAlignment="outside"
                        isLabelVisible={false}
                        completed={
                          donation.type === "App\\Models\\ProductDonation"
                            ? donation.type_attributes
                                .fulfilled_product_amount || 0
                            : donation.type === "App\\Models\\Fundraiser"
                            ? donation.type_attributes.current_fund || 0
                            : 0
                        }
                        maxCompleted={
                          donation.type === "App\\Models\\ProductDonation"
                            ? donation.type_attributes.product_amount || 100
                            : donation.type === "App\\Models\\Fundraiser"
                            ? donation.type_attributes.target_fund || 100
                            : 100
                        }
                      />
                      <div className="w-full flex flex-row justify-start">
                        <h1 className="font-thin text-xs self-center text-center">
                          Terkumpul sebanyak:{" "}
                        </h1>
                        <h2 className="font-thin text-xs self-center text-center px-2">
                          {donation.type === "App\\Models\\ProductDonation"
                            ? donation.type_attributes
                                .fulfilled_product_amount || 0
                            : donation.type === "App\\Models\\Fundraiser"
                            ? formatPrice(
                                donation.type_attributes.current_fund || 0
                              )
                            : "-"}{" "}
                          /{" "}
                          {donation.type === "App\\Models\\ProductDonation"
                            ? donation.type_attributes.product_amount || 0
                            : donation.type === "App\\Models\\Fundraiser"
                            ? formatPrice(
                                donation.type_attributes.target_fund || 0
                              )
                            : "-"}
                        </h2>
                      </div>
                    </div>
                    <div className="w-full flex flex-row gap-2">
                      <Link
                        className="flex-1 flex h-[50px] hover:bg-primary-bg bg-primary-accent items-center justify-center rounded-md"
                        to={`/donation/${donation.id}`}
                      >
                        <h3 className=" text-md font-semibold text-primary-fg text-center items-center justify-center">
                          Detail
                        </h3>
                      </Link>{" "}
                      <Button
                        className="flex-1 h-[50px] hover:bg-green-600 bg-green-500 text-white"
                        onClick={() => setIsModalEnableCharity(true)}
                      >
                        Donasi Buku
                      </Button>
                    </div>
                  </CardFooter>
                </div>
                <div className="w-9/12 h-full items-center justify-center flex flex-col bg-cover bg-center rounded-r-xl ]">
                  <img
                    src={donation.header_image}
                    alt="Charity Image"
                    className="w-full h-full object-cover rounded-r-xl"
                  />
                </div>
              </div>
            </Card>
          )
      )}
      {isModalEnableCharity && (
        <div className="fixed z-50 inset-0 bg-black bg-opacity-50 flex text-primary-bg items-center justify-center">
          <div className="bg-white w-1/3 h-5/6 rounded-xl flex flex-col">
            {testAuth.user ? (
              <div className="w-full h-full flex flex-col p-4 overflow-y-auto">
                <h1 className="text-xl font-bold">Pilih Nominal Donasi</h1>
                <div className="relative w-full">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                    Rp.
                  </span>
                  <Input
                    placeholder="0"
                    type="number"
                    className="w-full h-[50px] pl-10 text-primary-bg rounded-b-none"
                    value={donationAmount}
                    onChange={(e) => setDonationAmount(e.target.value)}
                  />
                </div>
                <div className="w-full h-[50px] flex flex-row items-center rounded-t-none justify-start bg-muted-foreground/30 p-4 rounded-xl">
                  <IoDocumentTextOutline className="w-5 h-5 text-primary-bg" />
                  <Input
                    placeholder="Catatan (Opsional)"
                    className="w-full focus:border-transparent focus-visible:ring-0 h-[50px] border-none shadow-none"
                  />
                </div>
                <div className="w-full py-4 grid grid-cols-3 gap-4">
                  {nominal_donasi.map(
                    (nominal: NominalDonasi, index: number) =>
                      index < 6 && (
                        <Button
                          key={index}
                          className="text-primary-bg hover:bg-primary-fg bg-muted-foreground/50"
                          onClick={() =>
                            setDonationAmount(nominal.nominal.toString())
                          }
                        >
                          Rp {nominal.nominal}
                        </Button>
                      )
                  )}
                </div>
                <h1 className="text-xl font-bold self-start">Detail Donasi</h1>
                {initiator_data.map(
                  (initiator: InitiatorData, index: number) =>
                    index < 1 && (
                      <div
                        className="w-full h-[75px] flex  rounded-xl items-center flex-row gap-4 justify-start"
                        key={index}
                      >
                        <div className="w-12 h-12 flex items-center aspect-square justify-center rounded-full bg-[url(/images/Charity1.jpeg)] bg-center bg-cover cursor-pointer text-primary-fg"></div>
                        <div className="w-full flex-col items-start justify-center flex">
                          <h1 className="text-lg font-bold">
                            {initiator.donation_title}
                          </h1>
                          <h1 className="text-sm font-semibold">
                            {initiator.user.username}
                          </h1>
                          <p className="text-xs text-muted-foreground">
                            {initiator.organization}
                          </p>
                        </div>
                      </div>
                    )
                )}
                <h1 className="text-lg font-bold self-start">Pembayaran</h1>
                <div className="w-full h-1/6 flex flex-row items-center justify-between gap-4">
                  <Button className="hover:bg-primary-fg w-full h-4/5 border border-primary-bg bg-primary-fg/40">
                    <img
                      src="/images/Qris.png"
                      className="w-full aspect-square h-full scale-75"
                    />
                  </Button>
                  <Button className="hover:bg-primary-fg w-full h-4/5 border border-primary-bg bg-primary-fg/40">
                    <img
                      src="/images/Bank.png"
                      className="w-3/4 aspect-square h-full scale-75"
                    />
                  </Button>
                </div>
                <div className="mt-auto flex flex-row items-center justify-between">
                  <Button className="hover:bg-primary-fg bg-primary-accent">
                    <a href="https://sites.google.com/view/termsandpolicy-donasipenggalan?usp=sharing">
                      Bantuan
                    </a>
                  </Button>
                  <Button onClick={() => setIsModalEnableCharity(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-4">
                <h1>Silahkan Login terlabih dahulu ya anjing</h1>
                <Button onClick={() => setIsModalEnableCharity(false)}>
                  Tutup
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
      {isDetail && (
        <CharityDetail isDetail={isDetail} setIsDetail={setIsDetail} />
      )}
    </>
  );
}
