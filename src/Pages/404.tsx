import { Link } from "@inertiajs/react";
import DinoGame from 'react-chrome-dino-ts'
import 'react-chrome-dino-ts/index.css'

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center overflow-x-auto h-screen bg-primary-bg text-primary-fg">
            {/* <DinoGame/> */}
            <h1 className="text-6xl font-bold">404</h1>
            <p className="text-2xl mt-4">Halamannya belum ada</p>
            <Link href="/" className="mt-6 text-primary-accent hover:underline">
                Home
            </Link>
        </div>
    );
}