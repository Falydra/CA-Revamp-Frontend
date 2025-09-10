import { Book } from "@/types";
import { Inertia } from "@inertiajs/inertia";
import { useState } from "react";

function formatPrice(value: number): string {
	return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

interface SearchBookProps {
	className?: string;
	onAddbook: (book: Book, amount: number) => void;
	onCreateNewBook?: () => void;
}

export default function SearchBook({
	className = "",
	onAddbook,
	onCreateNewBook,
}: SearchBookProps) {
	const [books, setBooks] = useState<Book[]>([]);

	const handleSearchBookChange = async (value: string) => {
		try {
			const baseUrl = import.meta.env.VITE_API_URL;
			const res = await fetch(
				`${baseUrl}/books/search?keyword=${encodeURIComponent(value)}`
			);
			const data = await res.json();
			setBooks(data.data);
			console.log("books: ", books);
		} catch (err) {
			setBooks([]);
			console.error("Search failed", err);
		}
	};

	return (
		<>
			<div className={`flex flex-col gap-4 relative ${className}`}>
				<label htmlFor="" className="flex flex-col">
					<input
						className="capitalize py-2 px-3 outline-none text-sm text-primary-fg text-opacity-75 bg-transparent border border-primary-fg/50 focus:border-primary-fg rounded-md  cursor-text"
						type="text"
						name=""
						id=""
						placeholder="cari judul buku"
						onChange={(e) => handleSearchBookChange(e.target.value)}
					/>
				</label>

				{books.length > 0 && (
					<div className="max-h-64 border border-primary-fg/50 overflow-y-scroll scroll-m-4 w-full bg-primary-bg">
						{books.map((book, index) => (
							<div
								key={book.isbn}
								className="flex flex-row gap-4 py-4 px-4 border border-primary-fg/50 "
							>
								<img
									src={book.cover_image}
									alt={book.title}
									className="max-h-20"
								/>
								<div className="flex flex-col gap-2 w-full">
									<p>{book.title}</p>
									<div className="flex flex-row gap-2 w-full text-xs text-primary-fg/80">
										{book.authors.map((author, idx) => (
											<p>{author},</p>
										))}
									</div>
									<p>
										Rp
										<span className="text-sm">
											{formatPrice(book.price)},00
										</span>
									</p>
								</div>
								<div className="flex">
									<button
										className="text-xs font-semibold px-3 py-1 mt-auto h-fit rounded-md border border-green-500 text-green-500 hover:bg-green-600 hover:border-green-600 hover:text-primary-fg active:bg-green-700 active:border-green-700 transition-colors duration-100"
										onClick={() => onAddbook(book, 1)}
									>
										tambah
									</button>
								</div>
							</div>
						))}
					</div>
				)}

				{books.length == 0 && (
					<div className="max-h-64 w-full bg-primary-bg flex items-center justify-center">
						<a
							className="text-xs font-semibold px-3 py-1 ml-auto mr-auto rounded-md border border-primary-fg text-primary-fg hover:bg-primary-fg hover:border-primary-fg hover:text-primary active:bg-primary active:border-primary-fg active:text-primary-fg transition-colors duration-100"
							href="/dashboard/donee/books/create"
						>
							Tambah Buku Baru
						</a>
					</div>
				)}
			</div>
		</>
	);
}
