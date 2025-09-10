export interface DonationData {
  id: number;
  title: string;
  text_descriptions: string[];
  header_image: string;
  type: "App\\Models\\ProductDonation" | "App\\Models\\Fundraiser";
  type_attributes: {
    fulfilled_product_amount?: number;
    product_amount?: number;
    current_fund?: number;
    target_fund?: number;
  };
  organization?: string;
  created_at?: string;
  status?: "active" | "completed" | "pending";
}

export const donationData: DonationData[] = [
  {
    id: 1,
    title: "Bantuan untuk Korban Bencana Alam",
    text_descriptions: [
      "Mari bersama-sama memberikan bantuan kepada korban bencana alam yang membutuhkan uluran tangan kita. Setiap sumbangan akan sangat berarti bagi mereka yang kehilangan tempat tinggal dan harta benda akibat bencana alam yang melanda.",
    ],
    header_image: "/images/Charity1.jpeg",
    type: "App\\Models\\ProductDonation",
    type_attributes: {
      fulfilled_product_amount: 75,
      product_amount: 150,
    },
    organization: "Yayasan Peduli Sesama",
    created_at: "2024-12-01",
    status: "active",
  },
  {
    id: 2,
    title: "Donasi untuk Anak Yatim Piatu",
    text_descriptions: [
      "Bantu kami memberikan kebahagiaan kepada anak-anak yatim piatu dengan donasi Anda. Setiap sumbangan akan digunakan untuk kebutuhan sehari-hari, pendidikan, dan kesehatan mereka agar dapat tumbuh menjadi generasi yang berguna bagi bangsa.",
    ],
    header_image: "/images/Charity1.jpeg",
    type: "App\\Models\\Fundraiser",
    type_attributes: {
      current_fund: 7500000,
      target_fund: 15000000,
    },
    organization: "Rumah Yatim Indonesia",
    created_at: "2024-11-15",
    status: "active",
  },
  {
    id: 3,
    title: "Program Beasiswa untuk Anak Kurang Mampu",
    text_descriptions: [
      "Pendidikan adalah hak setiap anak. Mari berpartisipasi dalam program beasiswa untuk anak-anak kurang mampu agar mereka dapat melanjutkan pendidikan dan meraih cita-cita mereka. Bersama kita wujudkan generasi cerdas Indonesia.",
    ],
    header_image: "/images/Charity1.jpeg",
    type: "App\\Models\\Fundraiser",
    type_attributes: {
      current_fund: 12000000,
      target_fund: 20000000,
    },
    organization: "Yayasan Pendidikan Nusantara",
    created_at: "2024-11-20",
    status: "active",
  },
  {
    id: 4,
    title: "Bantuan Makanan untuk Dhuafa",
    text_descriptions: [
      "Program bantuan makanan untuk saudara-saudara kita yang membutuhkan. Dengan donasi produk makanan, kita dapat membantu mereka yang kesulitan memenuhi kebutuhan pangan sehari-hari, terutama di bulan-bulan sulit ini.",
    ],
    header_image: "/images/Charity1.jpeg",
    type: "App\\Models\\ProductDonation",
    type_attributes: {
      fulfilled_product_amount: 120,
      product_amount: 200,
    },
    organization: "Komunitas Berbagi Makanan",
    created_at: "2024-12-05",
    status: "active",
  },
  {
    id: 5,
    title: "Pembangunan Sekolah di Daerah Terpencil",
    text_descriptions: [
      "Mari bersama membangun fasilitas pendidikan di daerah terpencil. Dengan kontribusi Anda, kami dapat memberikan akses pendidikan yang layak bagi anak-anak di pelosok nusantara yang selama ini kesulitan mengakses pendidikan berkualitas.",
    ],
    header_image: "/images/Charity1.jpeg",
    type: "App\\Models\\Fundraiser",
    type_attributes: {
      current_fund: 45000000,
      target_fund: 100000000,
    },
    organization: "Yayasan Membangun Negeri",
    created_at: "2024-10-10",
    status: "active",
  },
  {
    id: 6,
    title: "Bantuan Alat Kesehatan untuk Puskesmas",
    text_descriptions: [
      "Puskesmas di daerah pedesaan membutuhkan bantuan alat kesehatan untuk memberikan pelayanan kesehatan yang optimal. Mari kita dukung program ini agar masyarakat dapat mengakses layanan kesehatan yang memadai dan berkualitas.",
    ],
    header_image: "/images/Charity1.jpeg",
    type: "App\\Models\\ProductDonation",
    type_attributes: {
      fulfilled_product_amount: 25,
      product_amount: 80,
    },
    organization: "Yayasan Sehat Indonesia",
    created_at: "2024-11-30",
    status: "active",
  },
];

export const bookDonationData: DonationData[] = [
  {
    id: 7,
    title: "Donasi Buku Kalkulus untuk Mahasiswa",
    text_descriptions: [
      "Program donasi buku Kalkulus untuk mahasiswa yang kesulitan mengakses buku-buku berkualitas. Setiap donasi buku akan membantu mereka dalam proses pembelajaran dan meningkatkan pemahaman matematika dasar.",
    ],
    header_image: "/images/Charity1.jpeg",
    type: "App\\Models\\ProductDonation",
    type_attributes: {
      fulfilled_product_amount: 45,
      product_amount: 100,
    },
    organization: "Pustaka Pendidikan Nusantara",
    created_at: "2024-11-25",
    status: "active",
  },
  {
    id: 8,
    title: "Buku Pelajaran untuk Sekolah Pedesaan",
    text_descriptions: [
      "Mari bersama-sama mengumpulkan buku-buku pelajaran untuk sekolah-sekolah di pedesaan yang membutuhkan. Setiap buku yang Anda donasikan akan menjadi jendela ilmu bagi anak-anak di daerah terpencil.",
    ],
    header_image: "/images/Charity1.jpeg",
    type: "App\\Models\\ProductDonation",
    type_attributes: {
      fulfilled_product_amount: 78,
      product_amount: 150,
    },
    organization: "Yayasan Literasi Nusantara",
    created_at: "2024-11-20",
    status: "active",
  },
  {
    id: 9,
    title: "Perpustakaan Mini untuk Anak-Anak",
    text_descriptions: [
      "Bantu kami membangun perpustakaan mini untuk anak-anak dengan mendonasikan buku-buku cerita, ensiklopedia, dan buku edukatif lainnya. Setiap buku akan memperkaya khazanah pengetahuan mereka.",
    ],
    header_image: "/images/Charity1.jpeg",
    type: "App\\Models\\ProductDonation",
    type_attributes: {
      fulfilled_product_amount: 120,
      product_amount: 200,
    },
    organization: "Komunitas Baca Indonesia",
    created_at: "2024-12-01",
    status: "active",
  },
];

export const fetchDonationData = async (): Promise<DonationData[]> => {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return donationData;
};

export const fetchDonationById = async (
  id: number
): Promise<DonationData | null> => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const donation = donationData.find((item) => item.id === id);
  return donation || null;
};

export const fetchBookDonationData = async (): Promise<DonationData[]> => {
  await new Promise((resolve) => setTimeout(resolve, 800));

  return bookDonationData;
};
