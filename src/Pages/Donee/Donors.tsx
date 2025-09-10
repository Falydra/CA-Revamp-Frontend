import Authenticated from "@/Layout/AuthenticatedLayout";

export default function BookDonors() {
  return (
    <Authenticated>
      <div
        id="book-donors"
        className="text-white w-full h-2/5 items-start py-4 flex flex-col justify-start gap-2"
      >
        Donors
      </div>
    </Authenticated>
  );
}
