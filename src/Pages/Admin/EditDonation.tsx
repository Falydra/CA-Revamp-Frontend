import { useForm, usePage } from "@inertiajs/react";
import { useState } from "react";
import Authenticated from "@/Layouts/AuthenticatedLayout";
import { Donation, User } from "@/types";
import { TextField } from "@mui/material";

interface EditDonationProps {
    donation: Donation;
    auth: { user: User; roles: string };
    [key: string]: any;
}

export default function EditDonation() {
    const { donation } = usePage<EditDonationProps>().props;
    const { data, setData, patch, processing, errors } = useForm({
        title: donation.title || "",
        header_image: donation.header_image || "",
        text_description: Array.isArray(donation.text_descriptions)
        ? donation.text_descriptions.join("\n")
        : typeof donation.text_descriptions === "object"
            ? Object.values(donation.text_descriptions).join("\n")
            : donation.text_descriptions || "",
        image_description: donation.image_descriptions || "",
        target_amount: donation.type_attributes?.target_amount || "",
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        patch(route("admin.manage-donations.update", { id: donation.id }));
    }

    return (
        <Authenticated>
            <div className="w-full min-h-screen flex flex-col px-12 py-8 gap-4">
                <h2 className="text-primary-fg text-2xl font-bold self-start">
                    Modifikasi Donasi
                </h2>

                <div className="flex flex-col w-full gap-4 bg-trasnparent">
                    <label htmlFor="type" className="flex flex-col text-primary-fg bg-transparent">
                        Jenis Donasi
                        <TextField variant="outlined" disabled value={donation.type === "App\\Models\\Fundraiser" ? "Fundraiser" : "Donasi Produk"}></TextField>
                    </label>
                </div>
            </div>
        </Authenticated>
    );
}
