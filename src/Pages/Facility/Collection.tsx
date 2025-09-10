import { useState } from "react";
import { Facility } from "@/types";

type FacilityCollectionProps = {
    className?: string;
    addedFacilities: Facility[];
    onAddFacility: (facility: Facility) => void;
    onDeleteFacility: (facility: Facility) => void;
};

function formatPrice(value: number): string {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export default function FacilityCollection({
    className,
    addedFacilities,
    onAddFacility,
    onDeleteFacility,
}: FacilityCollectionProps) {
    const createEmptyFacility = (): Facility => ({
        id: Date.now().toString(),
        name: "",
        description: "",
        dimensions: "",
        material: "",
        price: 0,
        amount: 1,
        status: true,
    });

    return (
        <>
            <div className={`flex flex-col ${className}`}>
                <table className="table-fixed w-full text-sm text-center border border-primary-fg/50">
                    <thead>
                        <tr className="border border-primary-fg/50">
                            <th className="px-2 py-2 border-b border-primary-fg/50">
                                Nama
                            </th>
                            <th className="px-2 py-2 border-b border-primary-fg/50">
                                Deskripsi
                            </th>
                            <th className="px-2 py-2 border-b border-primary-fg/50">
                                Dimensi
                            </th>
                            <th className="px-2 py-2 border-b border-primary-fg/50">
                                Material
                            </th>
                            <th className="px-2 py-2 border-b border-primary-fg/50">
                                Harga
                            </th>
                            <th className="px-2 py-2 border-b border-primary-fg/50">
                                Jumlah
                            </th>
                            <th className="px-2 py-2 border-b border-primary-fg/50">
                                Aksi
                            </th>
                        </tr>
                    </thead>
                    <tbody className="text-start">
                        {addedFacilities.map((facility, index) => (
                            <tr key={index} className="text-start">
                                <td className="px-2 py-2 w-1/8 border-b text-start  border-primary-fg/50">
                                    <input
                                        type="text"
                                        className="py-2 px-3 outline-none text-sm text-primary-fg bg-transparent border border-primary-fg/50 focus:border-primary-fg rounded-md  cursor-text"
                                        value={facility.name}
                                        onChange={(e) =>
                                            onAddFacility({
                                                ...facility,
                                                name: e.target.value,
                                            })
                                        }
                                        placeholder="Nama Barang"
                                    />
                                </td>
                                <td className="px-2 py-2 w-1/8 border-b text-start border-primary-fg/50">
                                    <input
                                        type="text"
                                        className="py-2 px-3 outline-none text-sm text-primary-fg bg-transparent border border-primary-fg/50 focus:border-primary-fg rounded-md  cursor-text"
                                        value={facility.description}
                                        onChange={(e) =>
                                            onAddFacility({
                                                ...facility,
                                                description: e.target.value,
                                            })
                                        }
                                        placeholder="Deskripsi"
                                    />
                                </td>
                                <td className="px-2 py-2 w-1/8 border-b text-start border-primary-fg/50">
                                    <input
                                        type="text"
                                        className="py-2 px-3 outline-none text-sm text-primary-fg bg-transparent border border-primary-fg/50 focus:border-primary-fg rounded-md  cursor-text"
                                        value={facility.dimensions}
                                        onChange={(e) =>
                                            onAddFacility({
                                                ...facility,
                                                dimensions: e.target.value,
                                            })
                                        }
                                        placeholder="Ukuran"
                                    />
                                </td>
                                <td className="px-2 py-2 w-1/8 border-b text-center border-primary-fg/50">
                                    <input
                                        type="text"
                                        className="py-2 px-3 outline-none text-sm text-primary-fg bg-transparent border border-primary-fg/50 focus:border-primary-fg rounded-md  cursor-text"
                                        value={facility.material}
                                        onChange={(e) =>
                                            onAddFacility({
                                                ...facility,
                                                material: e.target.value,
                                            })
                                        }
                                        placeholder="Bahan"
                                    />
                                </td>
                                <td className="px-2 py-2 w-1/8 border-b text-center border-primary-fg/50">
                                    <input
                                        type="number"
                                        className="py-2 px-3 outline-none text-sm text-primary-fg bg-transparent border border-primary-fg/50 focus:border-primary-fg rounded-md  cursor-text appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                        value={facility.price}
                                        onChange={(e) =>
                                            onAddFacility({
                                                ...facility,
                                                price:
                                                    e.target.value === "0"
                                                        ? ""
                                                        : Number(
                                                              e.target.value
                                                          ),
                                            })
                                        }
                                        placeholder="Masukkan Angka"
                                    />
                                </td>
                                <td className="px-2 py-2 w-1/8 border-b text-center border-primary-fg/50">
                                    <button
                                        onClick={() => {
                                            onAddFacility({
                                                ...facility,
                                                amount: Number(
                                                    facility.amount - 1
                                                ),
                                            });
                                        }}
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={1.5}
                                            stroke="currentColor"
                                            className="size-4 ml-auto"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M5 12h14"
                                            />
                                        </svg>
                                    </button>

                                    <input
                                        type="number"
                                        name="amount"
                                        id="amount"
                                        className="max-w-6 m-2 bg-transparent border-b border-primary-bg focus:border-primary-fg text-center appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none focus:outline-none focus:ring-0 transition-all duration-100"
                                        value={facility.amount}
                                        onChange={(e) =>
                                            onAddFacility({
                                                ...facility,
                                                amount: Number(e.target.value),
                                            })
                                        }
                                    />

                                    <button
                                        onClick={() => {
                                            onAddFacility({
                                                ...facility,
                                                amount: Number(
                                                    facility.amount + 1
                                                ),
                                            });
                                        }}
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={1.5}
                                            stroke="currentColor"
                                            className="size-4 mr-auto"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M12 4.5v15m7.5-7.5h-15"
                                            />
                                        </svg>
                                    </button>
                                </td>
                                <td className="px-2 py-2 w-1/8 text-center border-b border-primary-fg/50 ">
                                    <button
                                        className="text-xs font-semibold px-3 py-1 ml-auto mr-auto rounded-md border border-red-400 text-red-400 hover:bg-red-500 hover:border-red-500 hover:text-primary-fg active:bg-red-600 active:border-red-600 transition-colors duration-100"
                                        onClick={() =>
                                            onDeleteFacility(facility)
                                        }
                                    >
                                        hapus
                                    </button>
                                </td>
                            </tr>
                        ))}
                        <tr>
                            <td colSpan={7} className="p-4 text-center">
                                <button
                                    className="text-xs font-semibold px-3 py-1 ml-auto mr-auto rounded-md border border-primary-fg text-primary-fg hover:bg-primary-fg hover:border-primary-fg hover:text-primary active:bg-primary active:border-primary-fg active:text-primary-fg transition-colors duration-100"
                                    onClick={() => {
                                        onAddFacility({
                                            ...createEmptyFacility(),
                                        });
                                    }}
                                >
                                    Tambah Barang
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </>
    );
}
