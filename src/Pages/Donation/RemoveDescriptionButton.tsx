
import { Button } from "@/Components/ui/button";
import { X } from "lucide-react";

interface RemoveDescriptionButtonProps {
    onClick: () => void;
}

export default function RemoveDescriptionButton({ onClick }: RemoveDescriptionButtonProps) {
    return (
        <Button
            type="button"
            onClick={onClick}
            variant="outline"
            size="sm"
            className="border-red-500 text-red-500 hover:bg-red-50"
        >
            <X className="w-4 h-4" />
        </Button>
    );
}