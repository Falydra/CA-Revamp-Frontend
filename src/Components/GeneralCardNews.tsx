import card_news_data from "@/config/card_news_data";
import { Link } from "react-router-dom";
import { IoIosArrowForward } from "react-icons/io";
export default function GeneralCardNews({
  isMore = false,
}: {
  isMore?: boolean;
}) {
  return (
    <div className="flex flex-col items-start w-full h-[750px] justify-start px-8">
      <div className="flex flex-row w-full h-4/5 items-center justify-center py-4 gap-4 ">
        {card_news_data.map(
          (news, index) =>
            index < 3 && (
              <div
                key={index}
                className="w-4/12 h-4/5 flex flex-col items-center justify-start bg-primary-fg hover:scale-105 transition-transform duration-500 ease-in-out rounded-2xl"
              >
                <div
                  className={`w-full h-2/5 flex items-center justify-center bg-[url(${news.image})] bg-cover bg-center rounded-t-2xl cursor-pointer `}
                />
                <h1 className="text-xl font-bold text-primary-bg px-4 pt-4 cursor-pointer">
                  {news.title}
                </h1>
                <p className="text-sm text-primary-bg px-4 text-justify">
                  {news.description}
                </p>
              </div>
            )
        )}
      </div>
      {isMore && (
        <div className="flex flex-row w-full  items-center justify-end gap-4 ">
          <Link
            href={route("news")}
            className="text-primary-fg self-end flex flex-row  items-center justify-end font-semibold hover:text-primary-accent"
          >
            Lihat Berita Lainnya
            <IoIosArrowForward />
          </Link>
        </div>
      )}
    </div>
  );
}
