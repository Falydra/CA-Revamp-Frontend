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
  const [requestData, setRequestData] = useState<RequestData>({
    username: "",
    delivery_service: "",
    resi: "",
    books: [],
    supplies: [],
    package_picture: undefined,
  });
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

      
      const isbn = book.attributes?.isbn ?? book.id;

      if (checked) {
        books.push({
          isbn: isbn,
          quantity: 1,
        });
      } else {
        books = books.filter((b) => b.isbn != isbn);
      }

      return { ...prev, books };
    });
  };

  const updateBookQuantity = (book: RequestedBook, quantity: number) => {
    setRequestData((prev) => {
      let books = prev.books ? [...prev.books] : [];
      const isbn = book.attributes?.isbn ?? book.id;
      
      const bookIndex = books.findIndex((b) => b.isbn === isbn);
      if (bookIndex !== -1) {
        books[bookIndex].quantity = Math.max(1, quantity);
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

  const updateSupplyQuantity = (supply: RequestedSupply, quantity: number) => {
    setRequestData((prev) => {
      let supplies = prev.supplies ? [...prev.supplies] : [];
      
      const supplyIndex = supplies.findIndex((s) => s.id === supply.id);
      if (supplyIndex !== -1) {
        supplies[supplyIndex].quantity = Math.max(1, quantity);
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
    <DialogContent className="max-w-2xl">
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
                  <div className="flex flex-col gap-2 max-h-96 overflow-y-auto scrollbar-hide pr-2">
                    {requestedBooks?.map((book) => {
                      const isSelected = requestData.books?.some(
                        (b) => b.isbn === (book.attributes?.isbn ?? book.id)
                      );
                      const selectedBook = requestData.books?.find(
                        (b) => b.isbn === (book.attributes?.isbn ?? book.id)
                      );

                      return (
                        <div
                          key={book.id}
                          className="px-2 py-1 select-none"
                        >
                          <div className="flex flex-row gap-4 items-center justify-between w-full">
                            <div className="flex flex-row gap-2 items-center flex-1 min-w-0">
                              <input
                                type="checkbox"
                                name={book.id}
                                id={book.id}
                                checked={!!isSelected}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  toggleBookSelection(book, e.target.checked);
                                }}
                                className="flex-shrink-0"
                              />
                              <label 
                                htmlFor={book.id}
                                className="flex flex-col min-w-0 flex-1 cursor-pointer overflow-hidden"
                              >
                                <p className="truncate text-sm">{book.attributes.title}</p>
                                <p className="text-xs text-gray-400">Book</p>
                              </label>
                            </div>
                            {isSelected && (
                              <div className="flex flex-row items-center gap-1 flex-shrink-0">
                                <button
                                  type="button"
                                  className="w-7 h-7 border rounded flex items-center justify-center hover:bg-gray-100 text-sm"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    updateBookQuantity(book, (selectedBook?.quantity || 1) - 1);
                                  }}
                                >
                                  -
                                </button>
                                <input
                                  type="number"
                                  min="1"
                                  value={selectedBook?.quantity || 1}
                                  onChange={(e) => {
                                    e.stopPropagation();
                                    const value = parseInt(e.target.value) || 1;
                                    updateBookQuantity(book, value);
                                  }}
                                  className="w-12 text-center border rounded py-1 outline-none text-sm"
                                  onClick={(e) => e.stopPropagation()}
                                />
                                <button
                                  type="button"
                                  className="w-7 h-7 border rounded flex items-center justify-center hover:bg-gray-100 text-sm"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    updateBookQuantity(book, (selectedBook?.quantity || 1) + 1);
                                  }}
                                >
                                  +
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {requestedSupplies?.map((item) => {
                      const isSelected = requestData.supplies?.some(
                        (i) => i.id === item.id
                      );
                      const selectedSupply = requestData.supplies?.find(
                        (i) => i.id === item.id
                      );

                      return (
                        <div
                          key={item.id}
                          className="px-2 py-1 select-none"
                        >
                          <div className="flex flex-row gap-4 items-center justify-between w-full">
                            <div className="flex flex-row gap-2 items-center flex-1 min-w-0">
                              <input
                                type="checkbox"
                                name={item.id}
                                id={item.id}
                                checked={!!isSelected}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  toggleSupplySelection(item, e.target.checked);
                                }}
                                className="flex-shrink-0"
                              />
                              <label
                                htmlFor={item.id}
                                className="flex flex-col min-w-0 flex-1 cursor-pointer overflow-hidden"
                              >
                                <p className="truncate text-sm">{item.attributes.name}</p>
                                <p className="text-xs text-gray-400">Supply</p>
                              </label>
                            </div>
                            {isSelected && (
                              <div className="flex flex-row items-center gap-1 flex-shrink-0">
                                <button
                                  type="button"
                                  className="w-7 h-7 border rounded flex items-center justify-center hover:bg-gray-100 text-sm"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    updateSupplyQuantity(item, (selectedSupply?.quantity || 1) - 1);
                                  }}
                                >
                                  -
                                </button>
                                <input
                                  type="number"
                                  min="1"
                                  value={selectedSupply?.quantity || 1}
                                  onChange={(e) => {
                                    e.stopPropagation();
                                    const value = parseInt(e.target.value) || 1;
                                    updateSupplyQuantity(item, value);
                                  }}
                                  className="w-12 text-center border rounded py-1 outline-none text-sm"
                                  onClick={(e) => e.stopPropagation()}
                                />
                                <button
                                  type="button"
                                  className="w-7 h-7 border rounded flex items-center justify-center hover:bg-gray-100 text-sm"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    updateSupplyQuantity(item, (selectedSupply?.quantity || 1) + 1);
                                  }}
                                >
                                  +
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
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
