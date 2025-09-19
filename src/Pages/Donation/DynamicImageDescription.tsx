import React from "react";
import RemoveDescriptionButton from "./RemoveDescriptionButton";

interface DynamicImageDescriptionProps {
    index: number;
    url: string;
    onChange: (index: number, e: React.ChangeEvent<HTMLInputElement>) => void;
    onRemove: (index: number) => void;
}

const DynamicImageDescription: React.FC<DynamicImageDescriptionProps> = ({
    index,
    url,
    onRemove,
}) => {
    return (
        <div className="flex flex-col gap-2 w-full" key={index}>
            <div className="flex flex-row justify-between items-center">
                <span className="text-gray-700 font-medium">Image Description #{index + 1}</span>
                <RemoveDescriptionButton onClick={() => onRemove(index)} />
            </div>
            <img src={url} alt={`Description ${index + 1}`} className="w-1/2 object-cover mx-auto rounded-md" />
        </div>
    );
};

export default DynamicImageDescription;