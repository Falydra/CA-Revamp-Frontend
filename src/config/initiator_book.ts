export interface InitiatorBookData {
  id: number;
  user: {
    id: number;
    username: string;
    name: string;
    email: string;
  };
  organization: string;
  donation_title: string;
  donationLimit: number;
  book_type: string;
  description: string;
  contact_info?: string;
}

const initiator_book_data: InitiatorBookData[] = [
  {
    id: 1,
    user: {
      id: 3,
      username: "pustaka_pendidikan",
      name: "Pustaka Pendidikan Nusantara",
      email: "contact@pustakapendidikan.org",
    },
    organization: "Pustaka Pendidikan Nusantara",
    donation_title: "Donasi Buku untuk Perpustakaan Desa",
    donationLimit: 500,
    book_type: "Kalkulus",
    description: "Yayasan yang bergerak dalam bidang pendidikan dan literasi",
    contact_info: "+62814-5678-9012",
  },
  {
    id: 2,
    user: {
      id: 4,
      username: "literasi_nusantara",
      name: "Literasi Nusantara",
      email: "info@literasinusantara.org",
    },
    organization: "Literasi Nusantara",
    donation_title: "Program Buku untuk Sekolah Terpencil",
    donationLimit: 1000,
    book_type: "Matematika",
    description:
      "Organisasi yang fokus pada peningkatan literasi di daerah terpencil",
    contact_info: "+62815-6789-0123",
  },
];

export default initiator_book_data;
