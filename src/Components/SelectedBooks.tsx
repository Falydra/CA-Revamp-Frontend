import { useState } from "react";
import DonationHistory from "@/Components/DonationHistory";
import { Button } from "./ui/button";
import AddtoCart from "./AddtoCart";
import { Books } from "@/types";



export default function SelectedBooks({ book }: {book: Books | null}) {
    const [addedBooks, setAddedBooks] = useState(false);
    const [isAdded, setIsAdded] = useState(false);
    const [selectedBook, setSelectedBook] = useState<Books | null>(null);

    const handleAddBooks = () => {
        setAddedBooks(!addedBooks);
    };

    const handleAddToCart = (book: Books) => {
        setIsAdded(!isAdded);
        setSelectedBook(book);
        
    };

    if (!book) {
        return <div>No book selected</div>;
    }

    return (
        <div className="w-full items-start flex flex-col min-h-screen">
            {!addedBooks ? (
                <div className="w-full items-start flex flex-col h-full">
                    <div className="w-full items-start flex flex-col justify-start h-full">
                        <div className="w-full py-4 px-4 flex flex-row items-center">
                            <h1 className="font-semibold text-xl text-primary-fg">
                                Selected Book
                            </h1>
                        </div>
                        <div className="w-full h-[250px] py-4 flex flex-col px-4">
                            <div
                                className="w-full h-[125px] rounded-xl bg-muted/50 hover:bg-primary-accent cursor-pointer"
                                onClick={handleAddBooks}
                                style={
                                  {backgroundImage: `url("${book.image}")`,
                                  backgroundSize: "cover",
                                  backgroundPosition: "center",
                                  
                                  
                                }}
                            />
                            <div className="flex flex-row justify-between w-full text-center mb-4">
                                <h2 className="text-primary-fg font-semibold text-lg self-center">
                                    Book Details
                                </h2>
                                <h2 className="text-primary-fg font-thin text-xs self-center">
                                    Estimated Delivery: 3 Days
                                </h2>
                            </div>
                            <div className="flex flex-row justify-between w-full text-center">
                                <h2 className="text-primary-fg text-sm self-center">
                                    Available Copies:
                                </h2>
                                <h2 className="text-primary-fg font-thin text-xs self-center">
                                    3/10
                                </h2>
                            </div>
                            <div className="flex flex-row justify-between w-full text-center">
                                <h2 className="text-primary-fg text-sm self-center">Status</h2>
                                <h2 className="text-primary-fg font-thin text-xs self-center">
                                    Available
                                </h2>
                            </div>
                        </div>
                        <DonationHistory />
                    </div>
                </div>
            ) : (
                <div className="w-full items-start flex flex-col h-full">
                    <div className="w-full items-start flex flex-col justify-start h-full">
                        <div className="w-full py-4 px-4 flex flex-row items-center">
                            <h1 className="font-semibold text-xl text-primary-fg">
                                Selected Book Details
                            </h1>
                        </div>
                        <div className="w-full h-[850px] py-3 flex flex-col px-4">
                            <div
                                className="w-full h-[125px] rounded-xl bg-cover bg-center hover:bg-primary-accent cursor-pointer"
                                onClick={handleAddBooks}
                                style={
                                  {backgroundImage: `url("${book.image}")`,
                                  backgroundSize: "cover",
                                  backgroundPosition: "center",
                                }
                              }
                            />
                            <div className="flex flex-row justify-between w-full text-center mb-4">
                                <h2 className="text-primary-fg font-semibold text-lg self-center">
                                    Book Details
                                </h2>
                                <h2 className="text-primary-fg font-thin text-xs self-center">
                                    Estimated Delivery: 3 Days
                                </h2>
                            </div>
                            <div className="flex flex-row justify-between w-full text-center">
                                <h2 className="text-primary-fg text-sm self-center">
                                    Available Copies:
                                </h2>
                                <h2 className="text-primary-fg font-thin text-xs self-center">
                                    3/10
                                </h2>
                            </div>
                            <div className="flex flex-row justify-between w-full text-center">
                                <h2 className="text-primary-fg text-sm self-center">Status</h2>
                                <h2 className="text-primary-fg font-thin text-xs self-center">
                                    Available
                                </h2>
                            </div>
                            <div className="w-full border border-primary-fg mt-2" />
                            <h2 className="text-primary-fg font-semibold text-lg self-start mt-2">
                                Title
                            </h2>
                            <h2 className="text-primary-fg text-md self-start">
                                {book.title}
                            </h2>
                            <h2 className="text-primary-fg font-semibold text-lg self-start mt-2">
                                Description
                            </h2>
                            <span className="text-primary-fg font-thin text-sm text-justify">
                                {book.description}
                            </span>
                            <div className="flex flex-row justify-between w-full text-center mt-2">
                                <h2 className="text-primary-fg font-semibold text-sm self-center">
                                    Author
                                </h2>
                                <h2 className="text-primary-fg font-thin text-xs self-center">
                                    {book.author}
                                </h2>
                            </div>
                            <div className="flex flex-row justify-between w-full text-center">
                                <h2 className="text-primary-fg font-semibold text-sm self-center">
                                    Publisher
                                </h2>
                                <h2 className="text-primary-fg font-thin text-xs self-center">
                                    {book.publisher}
                                </h2>
                            </div>
                            <div className="flex flex-row justify-between w-full text-center">
                                <h2 className="text-primary-fg font-semibold text-sm self-center">
                                    Publication Date
                                </h2>
                                <h2 className="text-primary-fg font-thin text-xs self-center">
                                    {book.published_date}
                                </h2>
                            </div>
                            <div className="flex flex-row justify-between w-full text-center">
                                <h2 className="text-primary-fg font-semibold text-sm self-center">
                                    City
                                </h2>
                                <h2 className="text-primary-fg font-thin text-xs self-center">
                                    {book.city}
                                </h2>
                            </div>
                            <div className="flex flex-row justify-between w-full text-center">
                                <Button
                                    onClick={() => handleAddToCart(book)}
                                    className="w-full bg-primary-accent text-primary-fg font-semibold text-sm self-center mt-4"
                                >
                                    Add to Cart
                                </Button>
                            </div>
                            <div className="flex flex-row justify-between w-full text-center">
                                <Button className="w-full bg-primary-accent text-primary-fg font-semibold text-sm self-center mt-4">
                                    Donate
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {isAdded && <AddtoCart isAdded={isAdded} setIsAdded={setIsAdded} book={book} />}
        </div>
    );
}