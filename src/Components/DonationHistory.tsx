import { MdHistory } from "react-icons/md";
import { FaDollarSign } from "react-icons/fa6";
import { IoMdCard } from "react-icons/io";

export default function DonationHistory() {
    return (
        <div className="w-full h-2/5 items-start py-4 flex flex-col justify-start gap-2">
            <h1 className="font-semibold text-xl text-primary-fg px-4">
                Donation History
            </h1>
            <div className="w-full items-center flex-row h-1/2 flex justify-start px-4 gap-2 cursor-pointer hover:bg-primary-accent">
                <div className="aspect-square rounded-full w-12 h-12 bg-primary-fg items-center justify-center m-2 flex">

                    <MdHistory className="text-primary-bg w-6 h-6" />
                </div>
                <div className="w-full flex flex-col items-start justify-center">
                    <h1 className="font-semibold text-md text-primary-fg">
                        Recent Donation
                    </h1>
                    <h2 className="self-start text-primary-fg font-thin text-xs">
                        Current Year
                    </h2>
                </div>
                <h2 className="text-primary-fg font-semibold text-lg self-center"> 
                    15
                </h2>
            </div>
            <div className="w-full items-center flex-row h-1/2 flex justify-start px-4 gap-2 cursor-pointer hover:bg-primary-accent ">
                <div className="aspect-square rounded-full w-12 h-12 m-2 bg-primary-fg items-center justify-center flex">

                    <FaDollarSign className="text-primary-bg w-5 h-5" />
                </div>
                <div className="w-full flex flex-col items-start justify-center">
                    <h1 className="font-semibold text-md text-primary-fg">
                        Financial
                    </h1>
                    <h2 className="self-start text-primary-fg font-thin text-xs">
                        Current Year
                    </h2>
                </div>
                <h2 className="text-primary-fg font-semibold text-lg self-center"> 
                    15
                </h2>
            </div>
            <div className="w-full items-center flex-row h-1/2 flex justify-start px-4 gap-2 cursor-pointer hover:bg-primary-accent">
                <div className="aspect-square rounded-full w-12 h-12 m-2 bg-primary-fg items-center justify-center flex">

                    <IoMdCard className="text-primary-bg w-5 h-5" />
                </div>
                <div className="w-full flex flex-col items-start justify-center">
                    <h1 className="font-semibold text-md text-primary-fg">
                        Donation Statistics
                    </h1>
                    <h2 className="self-start text-primary-fg font-thin text-xs">
                        Current Year
                    </h2>
                </div>
                <h2 className="text-primary-fg font-semibold text-lg self-center"> 
                    15
                </h2>
            </div>

        </div>
    )
}