import type { Campaign, RequestedBook, RequestedSupply, User } from "@/types";
import { DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./ui/carousel";
import { useEffect, useState } from "react";
import { apiService } from "@/services/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { toast } from "sonner";

type bookData = {
  isbn: string;
  quantity: number;
};

type supplyData = {
  id: string;
  quantity: number;
};

type RequestData = {
  username?: string;
  package_picture?: File;
  delivery_service?: string;
  resi?: string;
  books?: bookData[];
  supplies?: supplyData[];
};

type ErrorFields = {
  packagePicture: boolean;
  deliveryService: boolean;
  trackingNumber: boolean;
};

interface DonateItemFormProps {
  campaign: Campaign | null;
  requestedBooks?: RequestedBook[];
  requestedSupplies?: RequestedSupply[];
}

export default function DonateItemForm({
  campaign,
  requestedBooks,
  requestedSupplies,
}: DonateItemFormProps) {
  const user: User = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user") || "{}")
    : undefined;

  const [slidePage, setSlidePage] = useState(0);
  const [requestData, setRequestData] = useState<RequestData>({});
  const [errorFields, setErrorFields] = useState<ErrorFields>({
    packagePicture: false,
    deliveryService: false,
    trackingNumber: false,
  });

  const toggleBookSelection = (book: RequestedBook, checked: boolean) => {
    if (slidePage != 0) {
      setSlidePage(0);
    }

    setRequestData((prev) => {
      let books = prev.books ? [...prev.books] : [];

      if (checked) {
        books.push({
          isbn: book.id,
          quantity: 1,
        });
      } else {
        books = books.filter((b) => b.isbn != book.id);
      }

      return { ...prev, books };
    });
  };

  const toggleSupplySelection = (supply: RequestedSupply, checked: boolean) => {
    if (slidePage != 0) {
      setSlidePage(0);
    }

    setRequestData((prev) => {
      let supplies = prev.supplies ? [...prev.supplies] : [];

      if (checked) {
        supplies.push({
          id: supply.id,
          quantity: 1,
        });
      } else {
        supplies = supplies.filter((s) => s.id != supply.id);
      }

      return { ...prev, supplies };
    });
  };

  const handleUploadImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || undefined;
    setRequestData((prev) => ({
      ...prev,
      package_picture: file,
    }));
    setErrorFields((prev) => ({
      ...prev,
      packagePicture: false,
    }));
  };

  const handleSubmitDonation = async () => {
    try {
      if (campaign) {
        const formData = new FormData();

        if (requestData.package_picture) {
          formData.append("package_picture", requestData.package_picture);
        } else {
          setErrorFields((prev) => ({
            ...prev,
            packagePicture: true,
          }));
        }

        if (requestData.delivery_service) {
          formData.append(
            "delivery_service",
            String(requestData.delivery_service)
          );
        } else {
          setErrorFields((prev) => ({
            ...prev,
            deliveryService: true,
          }));
        }

        if (requestData.resi) {
          formData.append("resi", String(requestData.resi));
        } else {
          setErrorFields((prev) => ({
            ...prev,
            trackingNumber: true,
          }));
        }

        if (requestData.supplies) {
          requestData.supplies.forEach((supply, index) => {
            Object.entries(supply).forEach(([key, value]) => {
              formData.append(`supplies[${index}][${key}]`, String(value));
            });
          });
        }

        if (requestData.books) {
          requestData.books.forEach((book, index) => {
            Object.entries(book).forEach(([key, value]) => {
              formData.append(`books[${index}][${key}]`, String(value));
            });
          });
        }

        if (requestData.username) {
          formData.append("username", String(requestData.username));
        } else {
          formData.append("username", String("Kind Person"));
        }

        if (
          !(
            errorFields.deliveryService ||
            errorFields.packagePicture ||
            errorFields.trackingNumber
          )
        ) {
          const response = await apiService.createDonation(
            campaign.attributes.slug,
            formData
          );

          if (response.success) {
            toast("Success! please wait for verification");

            setTimeout(() => {
              window.location.href = `/campaigns/${campaign.attributes.slug}`;
            }, 2000);
          }
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
        <Carousel className="flex flex-col gap-4">
          <CarouselContent>
            <CarouselItem>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <p className="font-bold text-gray-600">
                    Select Items to Donate
                  </p>
                  <div className="flex flex-col gap-2 max-h-96 overflow-y-scroll scrollbar-hide">
                    {requestedBooks?.map((book) => {
                      const isSelected = requestData.books?.some(
                        (b) => b.isbn === book.id
                      );

                      return (
                        <label
                          key={book.id}
                          htmlFor={book.id}
                          className="px-2 py-1 select-none hover:cursor-pointer"
                        >
                          <div className="flex flex-row gap-4 items-center">
                            <input
                              type="checkbox"
                              name={book.id}
                              id={book.id}
                              checked={!!isSelected}
                              onChange={(e) => {
                                e.stopPropagation();
                                toggleBookSelection(book, e.target.checked);
                              }}
                            />
                            <div className="flex flex-row justify-between">
                              <div className="flex flex-col">
                                <p>{book.attributes.title}</p>
                                <p className="text-xs text-gray-400">Book</p>
                              </div>
                              <div className="flex flex-row gap-2">
                                <p></p>
                              </div>
                            </div>
                          </div>
                        </label>
                      );
                    })}

                    {requestedSupplies?.map((item) => {
                      const isSelected = requestData.supplies?.some(
                        (i) => i.id === item.id
                      );

                      return (
                        <label
                          key={item.id}
                          htmlFor={item.id}
                          className="px-2 py-1 select-none hover:cursor-pointer"
                        >
                          <div className="flex flex-row gap-4 items-center">
                            <input
                              type="checkbox"
                              name={item.id}
                              id={item.id}
                              checked={!!isSelected}
                              onChange={(e) => {
                                e.stopPropagation();
                                toggleSupplySelection(item, e.target.checked);
                              }}
                            />
                            <div className="flex flex-row justify-between">
                              <div className="flex flex-col">
                                <p>{item.attributes.name}</p>
                                <p className="text-xs text-gray-400">Supply</p>
                              </div>
                              <div className="flex flex-row gap-2">
                                <p></p>
                              </div>
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            </CarouselItem>

            <CarouselItem>
              <div className="flex flex-col gap-4">
                {!user && (
                  <div className="flex flex-col">
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
                  </div>
                )}

                <div className="flex flex-col">
                  <label
                    htmlFor="package-picture"
                    className="flex flex-col gap-2 text-gray-600"
                  >
                    <span className="font-bold hover:cursor-pointer">
                      Upload Package Photo
                    </span>
                    <input
                      type="file"
                      name="package-picture"
                      id="package-picture"
                      accept="image/png, image/jpeg, image/jpg, image/heic, image/webp"
                      onChange={(e) => {
                        handleUploadImage(e);
                      }}
                      required
                    />
                  </label>
                </div>

                <div className="flex flex-col">
                  <label
                    htmlFor="delivery-service"
                    className="flex flex-col gap-2 text-gray-600"
                  >
                    <span className="font-bold hover:cursor-pointer">
                      Delivery Service
                    </span>
                    <Select
                      value={requestData.delivery_service ?? ""}
                      onValueChange={(value) => {
                        setRequestData((prev) => ({
                          ...prev,
                          delivery_service: value,
                        }));
                        setErrorFields((prev) => ({
                          ...prev,
                          deliveryService: false,
                        }));
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Delivery Service" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="anteraja">AnterAja</SelectItem>
                        <SelectItem value="dhl">DHL</SelectItem>
                        <SelectItem value="jne">JNE</SelectItem>
                        <SelectItem value="jnt">JNT</SelectItem>
                        <SelectItem value="lion_parcel">Lion Parcel</SelectItem>
                        <SelectItem value="pos_indonesia">
                          Pos Indonesia
                        </SelectItem>
                        <SelectItem value="sicepat">SiCepat</SelectItem>
                        <SelectItem value="spx_express">SPX Express</SelectItem>
                      </SelectContent>
                    </Select>
                  </label>
                </div>

                <div className="flex flex-col">
                  <label
                    htmlFor="tracking-number"
                    className="flex flex-col gap-2 text-gray-600"
                  >
                    <span className="font-bold hover:cursor-pointer">
                      Tracking Number
                    </span>
                    <input
                      type="text"
                      name="tracking-number"
                      id="tracking-number"
                      className="border py-2 px-3 rounded-lg outline-none"
                      value={requestData.resi}
                      placeholder="xxxx-xxxx-xxxx"
                      onChange={(e) => {
                        setRequestData((prev) => ({
                          ...prev,
                          resi: e.target.value,
                        }));
                        setErrorFields((prev) => ({
                          ...prev,
                          trackingNumber: false,
                        }));
                      }}
                    />
                  </label>
                </div>
              </div>
            </CarouselItem>
            <CarouselItem>...</CarouselItem>
          </CarouselContent>
          <div className="flex flex-row h-fit justify-between">
            <CarouselPrevious
              size={"default"}
              className="!px-4 !py-2 capitalize"
              onClick={() => setSlidePage(slidePage - 1)}
            >
              back
            </CarouselPrevious>

            {((requestData.books ?? []).length > 0 ||
              (requestData.supplies ?? []).length > 0) &&
              slidePage === 0 && (
                <CarouselNext
                  size={"default"}
                  className="!px-4 !py-2 capitalize"
                  onClick={() => setSlidePage(slidePage + 1)}
                >
                  continue
                </CarouselNext>
              )}

            {slidePage === 1 && (
              <button
                className={`px-4 py-2 text-sm h-full rounded font-semibold transition-colors duration-100
                  ${
                    errorFields.deliveryService ||
                    errorFields.packagePicture ||
                    errorFields.trackingNumber
                      ? "text-gray-600 bg-slate-300 cursor-not-allowed"
                      : "text-white bg-pink-500 cursor-pointer active:bg-pink-600"
                  }`}
                disabled={
                  !(
                    (requestData.books ?? []).length > 0 ||
                    (requestData.supplies ?? []).length > 0
                  ) ||
                  errorFields.deliveryService ||
                  errorFields.packagePicture ||
                  errorFields.trackingNumber
                }
                onClick={() => handleSubmitDonation()}
              >
                Confirm
              </button>
            )}
          </div>
        </Carousel>
      </DialogHeader>
    </DialogContent>
  );
}
