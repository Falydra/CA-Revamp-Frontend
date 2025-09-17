import type { RequestedBook, RequestedSupply } from "@/types";
import { Popover, PopoverTrigger, PopoverContent } from "./ui/popover"
import ProgressBar from "./ui/progress-bar";

function formatPrice(value: number): string {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

interface RequestedItemProps {
  type: "book" | "supply";
  item: RequestedBook | RequestedSupply
}

export default function RequestedItem({
  type,
  item
}: RequestedItemProps) {
  if (type === "book") {
    const book = item as RequestedBook;
    return (
      <Popover>
        <PopoverTrigger className="px-4 py-3 border-t">
          <div className="flex flex-row gap-4">
            <div className="flex flex-col gap-1 w-3/5 text-sm text-left">
              <p className="font-medium text-gray-600">
                {book.attributes.title}
              </p>
              <p className="px-2 text-xs text-gray-400">Rp {formatPrice(book.attributes.price)}</p>
            </div>
            <div className="flex flex-col gap-1 w-2/5 text-sm items-end justify-center">
              <div className="flex flex-col gap-1 w-fit justify-center items-center">
                <p className="text-xs font-bold text-gray-600">
                  {book.attributes.donated_quantity} / {book.attributes.requested_quantity}
                </p>
                <ProgressBar
                  completed={book.attributes.donated_quantity}
                  maxCompleted={book.attributes.requested_quantity}
                  height={4}
                  isLabelVisible={false}
                  color={"pink"}
                ></ProgressBar>
              </div>

            </div>
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-96">
          <div className="flex flex-row gap-4">
            <div className="min-h-36 min-w-24 h-36 w-24">
              <img src={`${book.attributes.cover_image_url}`} alt="" />
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col">
                <div className="flex flex-row items-center justify-between">
                  <p className="font-medium text-gray-600">{book.attributes.title}</p>
                  <p className="text-sm text-gray-600">{book.attributes.published_year}</p>
                </div>
                <p className="text-xs text-gray-600/80">
                  {book.attributes.authors.author_1}
                  {book.attributes.authors.author_2 && <>, {book.attributes.authors.author_2}</>}
                </p>
              </div>
              <p className="text-xs text-gray-600 line-clamp-5">{book.attributes.synopsis}</p>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    )
  }

  const supply = item as RequestedSupply;

  return (
    <Popover>
      <PopoverTrigger className="px-4 py-3 border-t">
        <div className="flex flex-row gap-4">
          <div className="flex flex-col gap-1 w-3/5 text-sm text-left">
            <p className="font-medium text-gray-600 capitalize">
              {supply.attributes.name}
            </p>
            <p className="px-2 text-xs text-gray-400">Rp {formatPrice(supply.attributes.price)}</p>
          </div>
          <div className="flex flex-col gap-1 w-2/5 text-sm items-end justify-center">
            <div className="flex flex-col gap-1 w-fit justify-center items-center">
              <p className="text-xs font-bold text-gray-600">
                {supply.attributes.donated_quantity} / {supply.attributes.requested_quantity}
              </p>
              <ProgressBar
                completed={supply.attributes.donated_quantity}
                maxCompleted={supply.attributes.requested_quantity}
                height={4}
                isLabelVisible={false}
                color={"pink"}
              ></ProgressBar>
            </div>

          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent>
        <p className="text-sm text-gray-600">{supply.attributes.description}</p>
      </PopoverContent>
    </Popover>
  )
}