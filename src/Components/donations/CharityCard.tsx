import { usePage } from "@inertiajs/react";
import * as React from "react";
import { useState } from "react";
import { Card } from "../ui/card";

type CharityCardProps = {
    id: number;
    initiator_id: number;
    type: string;
    type_attributes: {
        [key: string]: string | number;
    };
    title: string;
    header_image: string;
    initiator: {
        id: number;
        username: string;
    };
}

export function CharityCard({
    id, initiator_id,
    type, type_attributes,
    title, header_image,
    initiator
}: CharityCardProps) {
    const { auth } = usePage().props;

    return (
        <>
            <Card className="w-80 h-72 bg-white">

            </Card>
        </>
    )
}
