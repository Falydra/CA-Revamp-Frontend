import { Book, BookWithAmount } from "@/types";
import { useState } from "react";

type BookCollectionProps = {
    className?: string;
    selectedBooks: BookWithAmount[];
    onChangeAmount: (book: Book, amount: number) => void;
    onDeleteBook: (book: Book) => void;
};

function formatPrice(value: number): string {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export default function BookCollection({
    className = "",
    selectedBooks,
    onChangeAmount,
    onDeleteBook
}: BookCollectionProps) {
    return (
        <>
            <div className={`flex flex-col ${className}`}>
                <div className="flex flex-col w-full items-center justify-center">
                    <div className="w-full max-h-[375px] overflow-y-auto rounded-md">
                        <table className="w-full text-sm text-center border border-primary-fg/50 rounded-md">
                            <thead>
                                <tr className="border border-primary-fg/50 rounded-md">
                                    <th className="px-2 py-2 border-b border-primary-fg/50 rounded-md">
                                        ISBN
                                    </th>
                                    <th className="px-2 py-2 border-b border-primary-fg/50">
                                        Judul
                                    </th>
                                    <th className="px-2 py-2 border-b border-primary-fg/50">
                                        Author
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
                                {selectedBooks.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="p-4 text-center"
                                        >
                                            Belum Menambahkan Buku
                                        </td>
                                    </tr>
                                )}

                                {selectedBooks.map((data, index) => (
                                    <tr
                                        key={data.book.isbn}
                                        className="text-start"
                                    >
                                        <td className="px-2 py-2 w-1/6 border-b text-start  border-primary-fg/50">
                                            {data.book.isbn}
                                        </td>
                                        <td className="px-2 py-2 w-1/6 border-b text-start border-primary-fg/50">
                                            {data.book.title}
                                        </td>
                                        <td className="px-2 py-2 w-1/6 border-b text-start border-primary-fg/50">
                                            {data.book.authors.map(
                                                (author, idx) => (
                                                    <p key={idx}>{author}</p>
                                                )
                                            )}
                                        </td>
                                        <td className="px-2 py-2 w-1/6 border-b text-center border-primary-fg/50">
                                            Rp
                                            <span className="text-xs">
                                                {formatPrice(data.book.price)}
                                                ,00
                                            </span>
                                        </td>
                                        <td className="px-2 py-2 w-1/6 border-b text-center border-primary-fg/50">
                                            <button
                                                onClick={() => {
                                                    onChangeAmount(
                                                        data.book,
                                                        -1
                                                    );
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
                                                value={data.amount}
                                            />

                                            <button
                                                onClick={() => {
                                                    onChangeAmount(
                                                        data.book,
                                                        1
                                                    );
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
                                        <td className="px-2 py-2 w-1/6 text-center border-b border-primary-fg/50 ">
                                            <button
                                            className="text-xs font-semibold px-3 py-1 ml-auto mr-auto rounded-md border border-red-400 text-red-400 hover:bg-red-500 hover:border-red-500 hover:text-primary-fg active:bg-red-600 active:border-red-600 transition-colors duration-100"
                                            onClick={() => {onDeleteBook(data.book)}}>
                                                hapus
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}
