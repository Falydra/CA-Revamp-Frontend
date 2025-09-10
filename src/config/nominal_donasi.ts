export interface NominalDonasi {
  id: number;
  nominal: number;
  label: string;
}

const nominal_donasi: NominalDonasi[] = [
  {
    id: 1,
    nominal: 50000,
    label: "50K",
  },
  {
    id: 2,
    nominal: 100000,
    label: "100K",
  },
  {
    id: 3,
    nominal: 200000,
    label: "200K",
  },
  {
    id: 4,
    nominal: 500000,
    label: "500K",
  },
  {
    id: 5,
    nominal: 1000000,
    label: "1M",
  },
  {
    id: 6,
    nominal: 2000000,
    label: "2M",
  },
];

export default nominal_donasi;
