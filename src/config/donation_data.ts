export interface DonationDataConfig {
  id: number;
  username: string;
  amount: number;
  date: string;
  message?: string;
}

const donation_data: DonationDataConfig[] = [
  {
    id: 1,
    username: "John Doe",
    amount: 150000,
    date: "2024-12-01",
    message: "Semoga membantu",
  },
  {
    id: 2,
    username: "Jane Smith",
    amount: 250000,
    date: "2024-12-02",
    message: "Untuk kebaikan bersama",
  },
  {
    id: 3,
    username: "Ahmad Rahman",
    amount: 100000,
    date: "2024-12-03",
  },
  {
    id: 4,
    username: "Maria Santos",
    amount: 300000,
    date: "2024-12-04",
    message: "Barakallahu fiikum",
  },
  {
    id: 5,
    username: "David Lee",
    amount: 200000,
    date: "2024-12-05",
  },
];

export default donation_data;
