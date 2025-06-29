
import { IoIosArrowForward } from "react-icons/io";
import {Link} from "react-router-dom";
export default function ProgramNews({isMore = false} : {isMore?: boolean}) {

    const data = [
        {
            title: "Program Pendidikan",
            description: "Menyediakan pendidikan berkualitas untuk anak-anak di lingkungan sekitar.",
            image: "https://example.com/education.jpg"
        },
        {
            title: "Program Kesehatan",
            description: "Memberikan layanan kesehatan gratis kepada masyarakat yang membutuhkan.",
            image: "https://example.com/health.jpg"
        },
        {
            title: "Program Lingkungan",
            description: "Mengadakan kegiatan penghijauan dan pelestarian lingkungan.",
            image: "https://example.com/environment.jpg"
        },
        {
            title: "Program Sosial",
            description: "Membantu masyarakat kurang mampu melalui berbagai inisiatif sosial.",
            image: "https://example.com/social.jpg"
        }
    ];



    return (
        <div className="flex flex-col items-start w-full h-[750px] justify-start px-8">
            <div className="flex flex-row w-full h-4/5 items-center justify-center py-4 gap-4 ">
                {data.map((news, index) => 
                    index < 3 && (
                        <div key={index} className="w-4/12 h-4/5 flex flex-col items-center justify-start bg-primary-fg hover:scale-105 transition-transform duration-500 ease-in-out rounded-2xl">
                            <div className={`w-full h-2/5 flex items-center justify-center bg-[url(${news.image})] bg-cover bg-center rounded-t-2xl cursor-pointer `}/>
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
                    <Link to={"/news"} className="text-primary-fg self-end flex flex-row  items-center justify-end font-semibold hover:text-primary-accent">
                        Lihat Berita Lainnya
                        <IoIosArrowForward/>
                    </Link>
    
                </div>
            )}
            
        </div>
            
    )
}