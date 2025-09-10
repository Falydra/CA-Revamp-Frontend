import GeneralCardNews from "@/Components/GeneralCardNews";
import Guest from "@/Layout/GuestLayout";

export default function GeneralNews() {
  const MultiCard = () => {
    return Array.from({ length: 5 }).map((_, i) => <GeneralCardNews key={i} />);
  };

  return (
    <Guest>
      <div className="pt-[60px] w-full ">
        <h1 className="text-2xl font-bold px-8">Berita Terbaru</h1>
        <p className="text-sm px-8">
          Berita terbaru dari Yayasan Nurul Hidayah tentang aktivitas, prestasi,
          dan informasi penting lainnya.
        </p>
        {MultiCard()}
      </div>
    </Guest>
  );
}
