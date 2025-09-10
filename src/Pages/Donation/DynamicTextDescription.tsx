import React from "react";
import RemoveDescriptionButton from "./RemoveDescriptionButton";

interface DynamicTextDescriptionProps {
    index: number;
    value: string;
    onChange: (index: number, e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    onRemove: (index: number) => void;
}

export default function DynamicTextDescription({ 
    index, 
    value, 
    onChange, 
    onRemove 
}: DynamicTextDescriptionProps) {
    return (
        <div className="flex flex-col gap-2">
            <label htmlFor={`description_${index}`} className="flex flex-row justify-between items-center">
                <span className="text-gray-700 font-medium">Deskripsi Teks #{index + 1}</span>
                <RemoveDescriptionButton onClick={() => onRemove(index)} />
            </label>
            <textarea
                className="py-2 px-3 outline-none text-sm border border-gray-300 focus:border-blue-500 rounded-md resize-vertical min-h-[100px]"
                name={`description_${index}`}
                id={`description_${index}`}
                placeholder="Masukkan deskripsi teks..."
                value={value}
                onChange={(e) => onChange(index, e)}
                rows={4}
            />
        </div>
    );
}