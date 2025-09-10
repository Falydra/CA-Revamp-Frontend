export interface InitiatorData {
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
  description: string;
  contact_info?: string;
}

const initiator_data: InitiatorData[] = [
  {
    id: 1,
    user: {
      id: 1,
      username: "yayasan_peduli",
      name: "Yayasan Peduli Sesama",
      email: "contact@yayasanpeduli.org",
    },
    organization: "Yayasan Peduli Sesama",
    donation_title: "Bantuan untuk Korban Bencana Alam",
    donationLimit: 15000000,
    description:
      "Yayasan yang bergerak dalam bidang kemanusiaan dan bantuan sosial",
    contact_info: "+62812-3456-7890",
  },
  {
    id: 2,
    user: {
      id: 2,
      username: "rumah_yatim",
      name: "Rumah Yatim Indonesia",
      email: "info@rumahyatim.org",
    },
    organization: "Rumah Yatim Indonesia",
    donation_title: "Donasi untuk Anak Yatim Piatu",
    donationLimit: 20000000,
    description:
      "Yayasan yang fokus pada pendidikan dan kesejahteraan anak yatim piatu",
    contact_info: "+62813-4567-8901",
  },
];

export default initiator_data;
