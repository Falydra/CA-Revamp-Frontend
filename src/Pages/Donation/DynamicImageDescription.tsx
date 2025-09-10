import React from "react";
import RemoveDescriptionButton from "./RemoveDescriptionButton";

interface DynamicImageDescriptionProps {
    index: any;
    url: string;
    onChange: (index: any, e: React.ChangeEvent<HTMLInputElement>) => void;
    onRemove: (index: any) => void;
}

const DynamicImageDescription: React.FC<DynamicImageDescriptionProps> = ({
    index,
    url,
    onChange,
    onRemove,
}) => {
    return (
        <label
            className="flex flex-col gap-2 w-full"
            htmlFor={index}
            key={index}
        >
            <div className="flex flex-row gap-2">
                Deskripsi
                <RemoveDescriptionButton
                    index={index}
                    onRemove={onRemove}
                ></RemoveDescriptionButton>
            </div>
            <img src={url} alt="image" className="w-1/2 object-cover mx-auto" />
        </label>
    );
};

export default DynamicImageDescription;
