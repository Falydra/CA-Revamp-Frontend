
import { Button } from "@/Components/ui/button";
import { Plus, FileText } from "lucide-react";

interface AddTextDescriptionButtonProps {
    onClick: () => void;
}

export default function AddTextDescriptionButton({ onClick }: AddTextDescriptionButtonProps) {
    return (
        <Button
            type="button"
            onClick={onClick}
            variant="outline"
            className="flex items-center gap-2 border-blue-500 text-blue-500 hover:bg-blue-50"
        >
            <Plus className="w-4 h-4" />
            <FileText className="w-4 h-4" />
            Tambah Deskripsi Teks
        </Button>
    );
}