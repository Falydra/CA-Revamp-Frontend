import React, { useRef } from "react";
import { Button } from "@/Components/ui/button";
import { Plus, Image } from "lucide-react";

interface AddImageDescriptionButtonProps {
    onFileSelected: (file: File) => void;
}

export default function AddImageDescriptionButton({ onFileSelected }: AddImageDescriptionButtonProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onFileSelected(file);
        }
    };

    return (
        <>
            <Button
                type="button"
                onClick={handleClick}
                variant="outline"
                className="flex items-center gap-2 border-green-500 text-green-500 hover:bg-green-50"
            >
                <Plus className="w-4 h-4" />
                <Image className="w-4 h-4" />
                Tambah Gambar
            </Button>
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
            />
        </>
    );
}