import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DynamicTextDescription from "./DynamicTextDescription";
import AddTextDescriptionButton from "./AddTextDescriptionButton";
import AddImageDescriptionButton from "./AddImageDescriptionButton";
import DynamicImageDescription from "./DynamicImageDescription";
import { Book, BookWithAmount, Facility } from "@/types";
import {
    Select,
    SelectContent,
    SelectTrigger,
    SelectValue,
    SelectItem,
    SelectGroup,
    SelectLabel,
} from "@/Components/ui/select";
import SearchBook from "../Book/Search";
import BookCollection from "../Book/Collection";
import FacilityCollection from "../Facility/Collection";
import { apiService } from "@/services/api";
import { toast } from "sonner";
import AuthenticatedLayout from "@/Layout/AuthenticatedLayout";

export default function CreateDonation() {
    const navigate = useNavigate();
    
    // donation data
    const [data, setData] = useState({
        type: "",
        title: "",
        description: "",
    });

    // header image
    const [headerImage, setHeaderImage] = useState<File | null>(null);
    const [previewImage, setPreviewImage] = useState("");
    
    const handleHeaderImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setHeaderImage(file);
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    // fundraiser attributes
    const [fundraiserAttr, setFundraiserAttr] = useState({
        target_fund: "",
    });

    // product donation attributes
    const [productDonationAttr, setProductDonationAttr] = useState({
        product_amount: "",
    });

    const [descriptions, setDescriptions] = useState<{ value: string | File }[]>([
        { value: "" }
    ]);

    // books with amount
    const [selectedBooks, setSelectedBooks] = useState<BookWithAmount[]>([]);

    // facilities data
    const [addedFacilities, setAddedFacilities] = useState<Facility[]>([]);

    // loading state
    const [isSubmitting, setIsSubmitting] = useState(false);

    // update books data
    const handleAddBook = (book: Book, amount = 1) => {
        setSelectedBooks((prev) => {
            const existing = prev.find((item) => item.book.isbn === book.isbn);

            if (existing) {
                const updatedAmount = existing.amount + amount;

                if (updatedAmount === 0) {
                    return prev.filter((item) => item.book.isbn !== book.isbn);
                }

                return prev.map((item) =>
                    item.book.isbn === book.isbn
                        ? { ...item, amount: item.amount + amount }
                        : item
                );
            }
            return [...prev, { book, amount }];
        });
    };

    const handleDeleteBook = (book: Book) => {
        setSelectedBooks((prev) => {
            return prev.filter((item) => item.book.isbn !== book.isbn);
        });
    };

    // update facility data
    const handleAddFacility = (updatedFacility: Facility) => {
        setAddedFacilities((prev) => {
            const exists = prev.some(
                (facility) => facility.id === updatedFacility.id
            );

            if (exists) {
                if (updatedFacility.amount === 0) {
                    return prev.filter(
                        (item) => item.id !== updatedFacility.id
                    );
                }

                return prev.map((facility) =>
                    facility.id === updatedFacility.id
                        ? updatedFacility
                        : facility
                );
            } else {
                return [...prev, updatedFacility];
            }
        });
    };

    const handleDeleteFacility = (facility: Facility) => {
        setAddedFacilities((prev) => {
            return prev.filter((item) => item.id !== facility.id);
        });
    };

    // update text description field
    const handleTextDescriptionChange = (
        index: number,
        e: React.ChangeEvent<HTMLTextAreaElement>
    ) => {
        const values = [...descriptions];
        values[index].value = e.target.value;
        setDescriptions(values);
    };

    // update image description field
    const handleImageDescriptionChange = (
        index: number,
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const values = [...descriptions];
        if (e.target.files?.[0]) {
            values[index].value = e.target.files[0];
            setDescriptions(values);
        }
    };

    // add new text description
    const handleAddTextDescription = () => {
        setDescriptions([...descriptions, { value: "" }]);
    };

    // add new image description
    const handleAddImageDescription = (file: File) => {
        setDescriptions((prev) => [...prev, { value: file }]);
    };

    // remove input fields
    const handleRemoveFields = (index: number) => {
        const newDescriptions = [...descriptions];
        newDescriptions.splice(index, 1);
        setDescriptions(newDescriptions);
    };

    // handle submit
    const handleSubmit = async () => {
        try {
            setIsSubmitting(true);

            // Validation
            if (!data.type || !data.title) {
                toast.error("Please fill in all required fields");
                return;
            }

            if (data.type === "fundraiser" && !fundraiserAttr.target_fund) {
                toast.error("Please set target fund amount");
                return;
            }

            if (data.type === "product_donation" && selectedBooks.length === 0 && addedFacilities.length === 0) {
                toast.error("Please add at least one book or facility");
                return;
            }

            const payload = new FormData();

            payload.append("type", data.type);
            payload.append("title", data.title);
            payload.append("description", data.description);

            if (headerImage) {
                payload.append("header_image", headerImage);
            }

            // append descriptions
            descriptions.forEach((description, index) => {
                if (typeof description.value === "string" && description.value.trim()) {
                    payload.append(`text_descriptions[${index}]`, description.value);
                } else if (description.value instanceof File) {
                    payload.append(`image_descriptions[${index}]`, description.value);
                }
            });

            let product_fund = 0;

            // append books for product donation
            if (data.type === "product_donation") {
                selectedBooks.forEach((bookItem, index) => {
                    payload.append(`requested_books[${index}][isbn]`, bookItem.book.isbn);
                    payload.append(`requested_books[${index}][quantity]`, String(bookItem.amount));
                    product_fund += bookItem.book.price * bookItem.amount;
                });

                // append facilities
                addedFacilities.forEach((facility, index) => {
                    payload.append(`requested_supplies[${index}][name]`, facility.name);
                    payload.append(`requested_supplies[${index}][description]`, facility.description);
                    payload.append(`requested_supplies[${index}][quantity_needed]`, String(facility.amount));
                    payload.append(`requested_supplies[${index}][unit]`, "pcs");
                    product_fund += Number(facility.price) * facility.amount;
                });

                payload.append("requested_fund_amount", "0");
                payload.append("requested_item_quantity", String(selectedBooks.length + addedFacilities.length));
            } else {
                // fundraiser
                payload.append("requested_fund_amount", fundraiserAttr.target_fund);
                payload.append("requested_item_quantity", "0");
            }

            const response = await apiService.createCampaign(payload);

            if (response.data?.success) {
                toast.success("Campaign created successfully!");
                navigate("/dashboard/donee");
            } else {
                toast.error("Failed to create campaign");
            }
        } catch (error: any) {
            console.error("Create campaign error:", error);
            if (error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error("Failed to create campaign");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AuthenticatedLayout>
            <div className="w-full min-h-screen flex flex-col p-4 gap-4">
                <h2 className="text-gray-900 text-2xl font-bold self-start">
                    Buat Kampanye Baru
                </h2>

                <div className="flex flex-col w-full gap-4 bg-white p-6 rounded-lg shadow">
                    <label htmlFor="type" className="flex flex-col text-gray-700">
                        Jenis Kampanye
                        <Select
                            name="type"
                            onValueChange={(value) => {
                                setData({ ...data, type: value });
                            }}
                        >
                            <SelectTrigger className="w-full border border-gray-300 focus:border-blue-500">
                                <SelectValue placeholder="--- Pilih Jenis Kampanye ---" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>--- Pilih Jenis Kampanye ---</SelectLabel>
                                    <SelectItem value="fundraiser" className="cursor-pointer">
                                        Penggalangan Dana
                                    </SelectItem>
                                    <SelectItem value="product_donation" className="cursor-pointer">
                                        Donasi Produk
                                    </SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                        <span className="text-gray-500 text-sm py-2">
                            Pilih jenis kampanye yang ingin dibuat
                        </span>
                    </label>

                    {data.type && data.type === "fundraiser" && (
                        <label htmlFor="target_fund" className="flex flex-col">
                            Jumlah Target Dana
                            <input
                                className="py-2 px-3 outline-none text-sm border border-gray-300 focus:border-blue-500 rounded-md"
                                type="number"
                                name="target_fund"
                                id="target_fund"
                                placeholder="Masukkan target dana"
                                value={fundraiserAttr.target_fund}
                                onChange={(e) =>
                                    setFundraiserAttr({
                                        ...fundraiserAttr,
                                        target_fund: e.target.value,
                                    })
                                }
                            />
                            <span className="text-gray-500 text-sm py-2">
                                Jumlah dana yang ingin dikumpulkan
                            </span>
                        </label>
                    )}

                    {data.type === "product_donation" && (
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col">
                                <label className="text-gray-700 font-medium mb-2">Tambahkan Buku</label>
                                <div className="flex flex-row gap-4">
                                    <BookCollection
                                        className="w-2/3"
                                        selectedBooks={selectedBooks}
                                        onChangeAmount={handleAddBook}
                                        onDeleteBook={handleDeleteBook}
                                    />
                                    <SearchBook
                                        className="w-1/3"
                                        onAddbook={handleAddBook}
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <label className="text-gray-700 font-medium mb-2">Tambahkan Barang</label>
                                <div className="flex flex-row gap-4">
                                    <FacilityCollection
                                        className="w-full"
                                        addedFacilities={addedFacilities}
                                        onAddFacility={handleAddFacility}
                                        onDeleteFacility={handleDeleteFacility}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <label htmlFor="title" className="flex flex-col">
                        Judul Kampanye
                        <input
                            className="py-2 px-3 outline-none text-sm border border-gray-300 focus:border-blue-500 rounded-md"
                            type="text"
                            name="title"
                            id="title"
                            placeholder="Masukkan judul kampanye"
                            value={data.title}
                            onChange={(e) =>
                                setData({ ...data, title: e.target.value })
                            }
                            required
                        />
                        <span className="text-gray-500 text-sm py-2">
                            Judul kampanye yang akan ditampilkan
                        </span>
                    </label>

                    <label htmlFor="description" className="flex flex-col">
                        Deskripsi
                        <textarea
                            className="py-2 px-3 outline-none text-sm border border-gray-300 focus:border-blue-500 rounded-md"
                            name="description"
                            id="description"
                            rows={4}
                            placeholder="Masukkan deskripsi kampanye"
                            value={data.description}
                            onChange={(e) =>
                                setData({ ...data, description: e.target.value })
                            }
                        />
                        <span className="text-gray-500 text-sm py-2">
                            Deskripsi detail tentang kampanye
                        </span>
                    </label>

                    <label htmlFor="header_image" className="flex flex-col">
                        Gambar Header
                        <input
                            type="file"
                            name="header"
                            id="header"
                            accept="image/*"
                            onChange={handleHeaderImageUpload}
                            className="p-2 border border-gray-300 rounded-md"
                        />
                        {previewImage && (
                            <img
                                src={previewImage}
                                alt="header_image"
                                className="mx-auto w-1/2 mt-2 rounded-md"
                            />
                        )}
                    </label>

                    {descriptions.map((inputField, index) =>
                        typeof inputField.value === "string" ? (
                            <DynamicTextDescription
                                key={index}
                                index={index}
                                value={inputField.value}
                                onChange={handleTextDescriptionChange}
                                onRemove={handleRemoveFields}
                            />
                        ) : inputField.value instanceof File ? (
                            <DynamicImageDescription
                                key={index}
                                index={index}
                                url={URL.createObjectURL(inputField.value)}
                                onChange={handleImageDescriptionChange}
                                onRemove={handleRemoveFields}
                            />
                        ) : (
                            <div key={index}></div>
                        )
                    )}

                    <div className="flex flex-row gap-4">
                        <AddTextDescriptionButton
                            onClick={handleAddTextDescription}
                        />
                        <AddImageDescriptionButton
                            onFileSelected={handleAddImageDescription}
                        />
                    </div>

                    <div className="flex flex-row gap-2 mx-auto w-full mt-6">
                        <button 
                            onClick={() => navigate(-1)}
                            className="p-2 w-full rounded-md text-red-500 font-medium border border-red-500 hover:bg-red-500 hover:text-white active:bg-red-600 transition-colors duration-100"
                        >
                            Kembali
                        </button>
                        <button
                            className="p-2 w-full rounded-md text-green-500 font-medium border border-green-500 hover:bg-green-500 hover:text-white active:bg-green-600 transition-colors duration-100 disabled:opacity-50"
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Menyimpan..." : "Konfirmasi"}
                        </button>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}