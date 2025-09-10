import Authenticated from "@/Layout/AuthenticatedLayout";
import { Button, styled } from "@mui/material";
import { grey } from "@mui/material/colors";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { router } from "@inertiajs/react";
import { toast } from "sonner";

const BackButton = styled(Button)(({ theme }) => ({
  color: grey["A200"],
  textTransform: "capitalize",
}));

type FormDataType = {
  isbn: string;
  title: string;
  authors: string;
  published_year: string;
  synopsis: string;
  cover_image: File | null;
  price: string;
};

export default function CreateBook() {
  const [formData, setFormData] = useState<FormDataType>({
    isbn: "",
    title: "",
    authors: "",
    published_year: "",
    synopsis: "",
    cover_image: null,
    price: "",
  });

  useEffect(() => {
    const isbn = Cookies.get("book_isbn");
    const title = Cookies.get("book_title");
    const authors = Cookies.get("book_authors");
    const published_year = Cookies.get("book_published_year");
    const synopsis = Cookies.get("book_synopsis");
    const price = Cookies.get("book_price");

    setFormData((prev) => ({
      ...prev,
      isbn: isbn ?? "",
      title: title ?? "",
      authors: authors ?? "",
      published_year: published_year ?? "",
      synopsis: synopsis ?? "",
      price: price ?? "",
    }));
  }, []);

  const handleInput = (key: string, value: string | File) => {
    setFormData((prev) => ({ ...prev, [key]: value }));

    if (typeof value === "string") {
      Cookies.set(`book_${key}`, value, { expires: 1 });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      setFormData((prev) => ({ ...prev, ["cover_image"]: file }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    Cookies.remove("book_title");
    Cookies.remove("book_isbn");
    Cookies.remove("book_authors");
    Cookies.remove("book_published_year");
    Cookies.remove("book_synopsis");
    Cookies.remove("book_price");

    const payload = new FormData();

    payload.append("data[isbn]", formData.isbn);
    payload.append("data[title]", formData.title);
    payload.append("data[authors][0]", formData.authors);
    payload.append("data[published_year]", formData.published_year);
    payload.append("data[synopsis]", formData.synopsis);
    payload.append("data[price]", formData.price);

    if (formData.cover_image) {
      payload.append("data[cover_image]", formData.cover_image);
    }

    await router.post("/books", payload, {
      onSuccess: () => {
        setFormData({
          isbn: "",
          title: "",
          authors: "",
          published_year: "",
          synopsis: "",
          price: "",
          cover_image: null,
        });
        toast.success("Buku berhasil ditambahkan");
      },
      onError: (err) => {
        toast.error("Buku gagal ditambahkan");
      },
    });
  };

  return (
    <Authenticated>
      <div className="flex flex-col px-12 py-8 gap-4 w-full">
        <div>
          <BackButton
            startIcon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 19.5 8.25 12l7.5-7.5"
                />
              </svg>
            }
            LinkComponent="a"
            href="/dashboard/donee"
          >
            Kembali
          </BackButton>
        </div>

        <div className="flex flex-col gap-4 w-full items-center">
          <h2 className="text-primary-fg text-2xl font-bold">
            Tambahkan Buku Baru
          </h2>
          <form
            onSubmit={(e) => handleSubmit(e)}
            className="flex flex-col p-4 gap-4 w-2/3 h-fit rounded-lg border"
          >
            <div className="flex flex-row gap-4">
              <div className="flex flex-col gap-1 w-full">
                <label htmlFor="isbn">ISBN</label>
                <input
                  type="text"
                  name="isbn"
                  id="isbn"
                  placeholder="Masukkan ISBN"
                  className="px-2 py-1 bg-transparent border border-primary-fg/50 rounded-sm"
                  value={formData.isbn}
                  onChange={(e) => {
                    handleInput("isbn", e.target.value);
                  }}
                />
              </div>

              <div className="flex flex-col gap-1 w-full">
                <label htmlFor="title">Judul</label>
                <input
                  type="text"
                  name="title"
                  id="title"
                  placeholder="Masukkan Judul"
                  className="px-2 py-1 bg-transparent border border-primary-fg/50 rounded-sm"
                  value={formData.title}
                  onChange={(e) => {
                    handleInput("title", e.target.value);
                  }}
                />
              </div>
            </div>

            <div className="flex flex-row gap-4">
              <div className="flex flex-col gap-1 w-full">
                <label htmlFor="authors">Penulis</label>
                <input
                  type="text"
                  name="authors"
                  id="authors"
                  placeholder="Masukkan Nama Penulis"
                  className="px-2 py-1 bg-transparent border border-primary-fg/50 rounded-sm"
                  value={formData.authors}
                  onChange={(e) => {
                    handleInput("authors", e.target.value);
                  }}
                />
              </div>

              <div className="flex flex-col gap-1 w-full">
                <label htmlFor="published_year">Tahun Terbit</label>
                <input
                  type="number"
                  min={1900}
                  name="published_year"
                  id="published_year"
                  placeholder="Masukkan Tahun Terbit"
                  className="px-2 py-1 bg-transparent border border-primary-fg/50 rounded-sm"
                  value={formData.published_year}
                  onChange={(e) => {
                    handleInput("published_year", e.target.value);
                  }}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1 w-full">
              <label htmlFor="price">Harga</label>
              <input
                type="number"
                min={0}
                name="price"
                id="price"
                placeholder="Masukkan Harga"
                className="px-2 py-1 bg-transparent border border-primary-fg/50 rounded-sm"
                value={formData.price}
                onChange={(e) => {
                  handleInput("price", e.target.value);
                }}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="synopsis">Sinopsis</label>
              <textarea
                name="synopsis"
                id="synopsis"
                placeholder="Sinopsis"
                className="px-2 py-1 bg-transparent border border-primary-fg/50 rounded-sm"
                value={formData.synopsis}
                onChange={(e) => {
                  handleInput("synopsis", e.target.value);
                }}
                rows={4}
              ></textarea>
            </div>

            <div className="flex flex-col gap-1 w-full">
              <label htmlFor="cover_image">Foto Cover</label>
              <input
                type="file"
                name="cover_image"
                id="cover_image"
                onChange={handleImageUpload}
              />
            </div>

            <button
              type="submit"
              className="py-2 w-full border rounded-md hover:bg-primary-fg hover:text-primary-bg transition"
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    </Authenticated>
  );
}
