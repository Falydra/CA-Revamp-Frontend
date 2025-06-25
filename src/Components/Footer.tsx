import { FaFacebook } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { FaYoutube } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa";



export default function Footer() {
    return (
        <div className="flex w-full h-full md:flex-row flex-row bg-primary-fg items-start py-4 justify-center px-16 gap-8 overflow-y-hidden">
            
            <div className="flex flex-col w-4/12 h-full items-start justify-start gap-4 mt-[20px]">
                <h1 className="text-2xl font-extrabold text-primary-bg">Info Lainnya</h1>
                <p className="text-primary-bg text-lg">
                    Yayasan Nurul Hidayah adalah Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras bibendum tincidunt lorem, nec iaculis nisl. Cras eu vestibulum massa, in tincidunt turpis. Quisque eget mi ac lacus iaculis lobortis nec laoreet nisl. 
                </p>
                <div className="text-primary-bg">
                    <p><strong>Email:</strong> info@yayasan.org</p>
                    <p><strong>Telepon:</strong> +62 812-3456-7890</p>
                    <p><strong>Alamat:</strong> Jl. ... </p>
                </div>
            </div>

           
            <div className="flex flex-col w-4/12 h-full items-center justify-end mt-[20px]">
                <div className="flex flex-row items-center gap-8 mb-[30px]">
                   
                    <h2 className="text-xl text-primary-bg cursor-pointer">Tentang Kami</h2>
                    <h2 className="text-xl text-primary-bg cursor-pointer">Layanan Kami</h2>
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
                        className="w-12 h-12 bg-primary-bg rounded-full flex items-center justify-center"
                    >
                        <FaFacebook className="w-6 h-6 text-primary-fg" />
                    </a>
                    <a
                        href="https://www.youtube.com/c/UndipTV"
                        className="w-12 h-12 bg-primary-bg rounded-full flex items-center justify-center"
                    >
                        <FaYoutube className="w-6 h-6 text-primary-fg" />
                    </a>
                    <a
                        href="https://x.com/undip"
                        className="w-12 h-12 bg-primary-bg rounded-full flex items-center justify-center"
                    >
                        <FaXTwitter className="w-6 h-6 text-primary-fg" />
                    </a>
                    <a
                        href="https://www.instagram.com/undip.official/"
                        className="w-12 h-12 bg-primary-bg rounded-full flex items-center justify-center"
                    >
                        <FaInstagram className="w-12 h-12 text-primary-fg" />
                    </a>
                </div>
            </div>


        </div>
    );

}
