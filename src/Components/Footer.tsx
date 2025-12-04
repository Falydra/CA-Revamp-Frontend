import { FaFacebook } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { FaYoutube } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa";



export default function Footer() {
    return (
        <div className="flex w-full h-full md:flex-row flex-row bg-white items-start py-4 justify-center px-16 gap-8 overflow-y-hidden">
            
            <div className="flex flex-col w-4/12 h-full items-start justify-start gap-4 mt-[20px]">
                <h1 className="text-2xl font-extrabold text-blue-500">Info Lainnya</h1>
                <p className="text-blue-400 text-lg text-justify">
                    Perpustakaan Undip merupakan sebuah Unit Pelaksana Teknis di Universitas Diponegoro yang memberikan layanan perpustakaan. Selain itu UPT Perpustakaan Undip juga didukung oleh Perpustakaan yang ada di masing-masing fakultas dan jurusan. Perpustakaan Undip menempati sebuah gedung berlantai 4 di Kompleks Widya Puraya di belakang Komplek rektorat Universitas Diponegoro. 
                </p>
                <div className="text-blue-400">
                    <p><strong>Email:</strong> perpustakaanundip@gmail.com</p>
                    <p><strong>Telepon:</strong> 0821-3587-6098</p>
                    <p><strong>Alamat:</strong> Jl. Prof Sudarto, SH Gedung Widya Puraya, Tembalang, Semarang, Jawa Tengah 50275</p>
                </div>
            </div>

           
            <div className="flex flex-col w-4/12 h-full items-center justify-end mt-[20px]">
                <div className="flex flex-row items-center gap-8 mb-[30px]">
                   
                    <h2 className="text-xl text-blue-500 cursor-pointer">Tentang Kami</h2>
                    <h2 className="text-xl text-blue-500 cursor-pointer">Layanan Kami</h2>
                </div>
            </div>


           
            <div className="flex flex-col w-4/12 h-full items-center justify-center gap-4 mt-[20px]">
                <div className="flex items-center justify-center w-full">
                    <img
                        src="/images/LogoYayasan.png"
                        className="w-1/3 aspect-square object-contain"
                    />
                </div>

               
                <div className="flex flex-row items-center justify-between w-full px-4">
                    <a
                        href="https://www.facebook.com/undip.official"
                        className="w-12 h-12 bg-blue-400 rounded-full flex items-center justify-center"
                    >
                        <FaFacebook className="w-6 h-6 text-primary-fg" />
                    </a>
                    <a
                        href="https://www.youtube.com/c/UndipTV"
                        className="w-12 h-12 bg-blue-400 rounded-full flex items-center justify-center"
                    >
                        <FaYoutube className="w-6 h-6 text-primary-fg" />
                    </a>
                    <a
                        href="https://x.com/undip"
                        className="w-12 h-12 bg-blue-400 rounded-full flex items-center justify-center"
                    >
                        <FaXTwitter className="w-6 h-6 text-primary-fg" />
                    </a>
                    <a
                        href="https://www.instagram.com/undip.official/"
                        className="w-12 h-12 bg-blue-400 rounded-full flex items-center justify-center"
                    >
                        <FaInstagram className="w-8 h-8 text-primary-fg" />
                    </a>
                </div>
            </div>


        </div>
    );

}
