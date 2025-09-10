import initiator_data from "@/config/initiator_data";
import ProgressBar from "@ramonak/react-progress-bar";
import { IoIosArrowForward } from "react-icons/io";
import { IoPersonOutline } from "react-icons/io5";
import { Button } from "@/Components/ui/button";
import { CardTitle, CardDescription } from "./ui/card";
import {
  progressCompleted,
  totalDays,
  totalDonation,
  donationLimit,
  totalUserDonate,
} from "@/config/donation_attr";
import { useState } from "react";

export default function CharityDetail({
  isDetail,
  setIsDetail,
}: {
  isDetail: boolean;
  setIsDetail?: boolean;
}) {
  const [isDetailDonatur, setIsDetailDonatur] = useState(false);

  const handleDetail = () => {
    setIsDetail(true);
  };

  const handleDetailDonatur = () => {
    setIsDetailDonatur(!isDetailDonatur);
  };

  return (
    <div className="fixed z-50 inset-0 bg-black bg-opacity-50 flex h-screen w-full items-center justify-center">
      <div className="bg-white w-1/3 h-screen rounded-xl flex flex-col text-primary-bg gap-4 items-start justify-start p-4 overflow-y-auto">
        <div className="w-full h-[250px] items-center justify-center flex flex-col bg-cover bg-center rounded-r-xl bg-[url(/images/Charity1.jpeg)]" />
        <div className="w-full h-screen flex flex-col items-start justify-start gap-4 overflow-y-auto">
          <CardTitle>Bantu Programmer Papua</CardTitle>
          {initiator_data.map(
            (initiator, index) =>
              index < 1 && (
                <div
                  className="w-full h-[75px] flex  rounded-xl items-center flex-row gap-4 justify-start"
                  key={index}
                >
                  <div className="w-12 h-12 flex items-center aspect-square justify-center rounded-full bg-primary-bg cursor-pointer text-primary-fg">
                    <IoPersonOutline className="w-5 h-5" />
                  </div>
                  <div className="w-full flex-col items-start justify-center flex ">
                    <p className="text-sm text-muted-foreground">
                      {initiator.organization}
                    </p>
                  </div>
                </div>
              )
          )}
          <div className="w-full flex flex-col items-start justify-end h-full">
            <h1 className="text-xl font-bold">Tersedia</h1>
            <p className="text-sm text-muted-foreground">
              {progressCompleted} / {totalDays} days elapsed
            </p>
            <ProgressBar
              className="w-full"
              height="10px"
              labelAlignment="outside"
              isLabelVisible={false}
              completed={progressCompleted}
              maxCompleted={totalDays}
            />
            <div className="w-full flex flex-row justify-start">
              <h1 className="font-thin text-xs self-center text-center">
                Terkumpul Rp.
              </h1>

              <h2 className="font-thin text-xs self-center text-center">
                {totalDonation} dari {donationLimit}
              </h2>
            </div>
            <h1 className="text-lg font-bold py-4">Detail Penggalangan Dana</h1>
            <CardDescription className="pr-4">
              Telah muncul seorang programmer jawa yang setiap harinya harus
              mencari rupiah. Programmer tersebut telah menghabiskan sisa
              hidupnya untuk membuat program yang tidak jelas dasarnya. Hingga
              pada akhirnya programmer tersebut memutuskan untuk meledakan diri
              dan menyebabkan luka yang sangat serius.
            </CardDescription>
            <a
              className="text-primary-accent hover:text-primary-bg/70 font-semibold text-sm flex flex-row self-end"
              onClick={handleDetail}
            >
              Detail
              <IoIosArrowForward className="text-md self-center" />
            </a>
          </div>

          <div
            className="w-full border-y border-primary-bg min-h-[50vh] flex flex-col items-start justify-start gap-4 overflow-y-auto"
            onClick={handleDetailDonatur}
          >
            <div className="flex flex-row w-full gap-4 items-center hover:bg-primary-accent/50 h-[50px] cursor-pointer">
              <CardTitle>Donasi</CardTitle>
              <div className="w-2/12 h-[20px] flex flex-col items-center justify-center rounded-3xl bg-primary-accent/40">
                <h1>{totalUserDonate}</h1>
              </div>
            </div>

            <div className="w-full flex flex-col shadow-lg">
              {/* {donation_data.map(
                    (donation, index) =>
                      index < 3 && (
                        <div className="w-full h-[75px] flex  rounded-xl items-center flex-row gap-4 justify-start" key={index}>
                          
                          <div
                          className="w-12 h-12 flex items-center aspect-square justify-center rounded-full bg-primary-bg cursor-pointer text-primary-fg"
                          >
                          <IoPersonOutline className="w-5 h-5" />
                          </div>
                          <div className="w-full flex-col items-start justify-center flex ">
                            <h1 className="text-md font-semibold">{donation.username}</h1>
                            <p className="text-sm text-muted-foreground">{donation.amount}</p>


                          </div>
                        </div>
                      )
                  )} */}
            </div>
          </div>

          <div className="w-full"></div>
        </div>
        <div className="w-full flex flex-row items-center justify-between gap-4">
          <Button onClick={() => setIsDetail(false)}>Tutup</Button>
          <Button onClick={() => setIsDetail(false)}>Donasi</Button>
        </div>
      </div>
    </div>
  );
}
