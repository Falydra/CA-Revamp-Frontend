// import { Link, useNavigate } from "react-router-dom";
// import { useState, useEffect } from "react";
// import Authenticated from "@/Layout/AuthenticatedLayout";
// import {
//   Box,
//   Button,
//   ButtonGroup,
//   Chip,
//   createTheme,
//   Pagination,
//   Paper,
//   styled,
//   Table,
//   TableBody,
//   TableCell,a
//   TableContainer,
//   TableHead,
//   TableRow,
//   ThemeProvider,
//   ToggleButton,
//   ToggleButtonGroup,
//   Typography,
// } from "@mui/material";
// import { amber, grey } from "@mui/material/colors";
// import { Inertia } from "@inertiajs/inertia";

// declare module "@mui/material/styles" {
//   interface Palette {
//     edit: Palette["primary"];
//     light: Palette["primary"];
//   }

//   interface PaletteOptions {
//     edit?: PaletteOptions["primary"];
//     light?: PaletteOptions["primary"];
//   }
// }

// declare module "@mui/material/Button" {
//   interface ButtonPropsColorOverrides {
//     edit: true;
//     light: true;
//   }
// }

// declare module "@mui/material/Chip" {
//   interface ChipPropsColorOverrides {
//     edit: true;
//     light: true;
//   }
// }

// const CustomToggleButton = styled(ToggleButton)(({ theme }) => ({
//   color: "#ddd7e4",
//   border: "1px solid #ddd7e4",
//   "&.Mui-selected": {
//     backgroundColor: "#ddd7e4",
//     color: theme.palette.grey[900],
//     border: "1px solid #ddd7e4",
//     "&:hover": {
//       backgroundColor: "#ddd7e4",
//     },
//   },
//   "&:hover": {
//     backgroundColor: "rgba(255, 255, 255, 0.1)",
//   },
// }));

// const theme = createTheme({
//   palette: {
//     edit: {
//       main: amber[400],
//       light: amber[300],
//       dark: amber[500],
//       contrastText: grey[900],
//     },
//     light: {
//       main: "#ffffff",
//       light: "#ffffff",
//       dark: grey[200],
//       contrastText: grey[900],
//     },
//   },
// });

// interface Donation {
//   id: number;
//   title: string;
// }

// interface DonorDonation {
//   id: number;
//   donation_id: number;
//   donation: Donation;
// }

// interface Fund {
//   id: number;
//   donor_donation_id: number;
//   type: string;
//   amount: number;
//   status: string;
//   redirect_url: string;
//   created_at: string;
//   donor_donation: DonorDonation;
// }

// interface Item {
//   id: number;
//   donor_donation_id: number;
//   type: string;
//   product_amount: number;
//   status: string;
//   created_at: string;
//   donor_donation: DonorDonation;
// }

// type DonationEntry = Fund | Item;

// interface PaginatedResponse<T> {
//   data: T[];
//   current_page: number;
//   last_page: number;
//   per_page: number;
//   total: number;
//   from: number | null;
//   to: number | null;
//   path: string;
//   prev_page_url: string | null;
//   next_page_url: string | null;
//   first_page_url: string;
//   last_page_url: string;
// }

// function formatDate(date: string) {
//   return new Date(date).toISOString().replace("T", " ").slice(0, 19);
// }

// function formatStatus(status: string) {
//   return status
//     .split("_")
//     .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
//     .join(" ");
// }

// async function fetchAllDonationHistory(
//   page = 1
// ): Promise<PaginatedResponse<DonationEntry>> {
//   const response = await fetch(`/donation-history/all?page=${page}`);
//   if (!response.ok) {
//     throw new Error(`HTTP error! status: ${response.status}`);
//   }

//   return await response.json();
// }

// async function fetchFundDonationHistory(
//   page = 1
// ): Promise<PaginatedResponse<DonationEntry>> {
//   const response = await fetch(`/donation-history/funds?page=${page}`);
//   if (!response.ok) {
//     throw new Error(`HTTP error! status: ${response.status}`);
//   }

//   return await response.json();
// }

// async function fetchProductDonationHistory(
//   page = 1
// ): Promise<PaginatedResponse<DonationEntry>> {
//   const response = await fetch(`/donation-history/items?page=${page}`);
//   if (!response.ok) {
//     throw new Error(`HTTP error! status: ${response.status}`);
//   }

//   return await response.json();
// }

// export default function DonationHistory() {
//   const [category, setCategory] = useState<string>("all");
//   const [donations, setDonations] = useState<DonationEntry[]>([]);
//   const [page, setPage] = useState(1);
//   const [lastPage, setLastPage] = useState(1);
//   const [loading, setLoading] = useState(true);
//   const [paginatedData, setPaginatedData] =
//     useState<PaginatedResponse<DonationEntry> | null>(null);

//   const formatter = new Intl.NumberFormat("id-ID", {
//     style: "currency",
//     currency: "IDR",
//     minimumFractionDigits: 0,
//   });

//   console.log(paginatedData);
//   console.log("hey");
//   console.log(paginatedData);
//   useEffect(() => {
//     setLoading(true);

//     if (category === "all") {
//       fetchAllDonationHistory(page)
//         .then((res) => {
//           setDonations(res.data);
//           setLastPage(res.last_page);
//           setPaginatedData(res);
//         })
//         .catch((err) => console.error(err))
//         .finally(() => setLoading(false));
//     } else if (category === "funds") {
//       fetchFundDonationHistory(page)
//         .then((res) => {
//           setDonations(res.data);
//           setLastPage(res.last_page);
//           setPaginatedData(res);
//         })
//         .catch((err) => console.error(err))
//         .finally(() => setLoading(false));
//     } else if (category === "items") {
//       fetchProductDonationHistory(page)
//         .then((res) => {
//           setDonations(res.data);
//           setLastPage(res.last_page);
//           setPaginatedData(res);
//         })
//         .catch((err) => console.error(err))
//         .finally(() => setLoading(false));
//     }
//   }, [category, page]);

//   const handleCategoryChange = (
//     event: React.MouseEvent<HTMLElement> | null,
//     newCategory: string
//   ) => {
//     if (newCategory !== null) {
//       setCategory(newCategory);
//       setPaginatedData(null);
//     }
//   };

//   const handlePageChange = (
//     event: React.ChangeEvent<unknown>,
//     page: number
//   ) => {
//     setPage(page);
//   };

//   return (
//     <Authenticated>
//       <div className="flex w-full flex-col max-h-screen items-start justify-start px-8 py-4 bg-primary-bg gap-4">
//         <h1 className="text-2xl font-bold">Riwayat Donasi</h1>
//         <div className="flex items-center gap-4">
//           <span className="text-base text-white">Kategori:</span>
//           <div className="flex gap-2">
//             <button
//               className={`px-4 py-1 rounded bg-primary-accent/70 text-white ${
//                 category === "all" ? "ring-1 ring-white" : ""
//               }`}
//               onClick={() => handleCategoryChange(null, "all")}
//             >
//               Semua
//             </button>
//             <button
//               className={`px-4 py-1 rounded bg-primary-accent/70 text-white ${
//                 category === "funds" ? "ring-1 ring-white" : ""
//               }`}
//               onClick={() => handleCategoryChange(null, "funds")}
//             >
//               Dana
//             </button>
//             <button
//               className={`px-4 py-1 rounded bg-primary-accent/70 text-white ${
//                 category === "items" ? "ring-1 ring-white" : ""
//               }`}
//               onClick={() => handleCategoryChange(null, "items")}
//             >
//               Produk
//             </button>
//           </div>
//         </div>

//         <div className="flex flex-col w-full items-center justify-center">
//           <div className="w-full max-h-[375px] overflow-y-auto rounded-md ">
//             <table className="w-full text-center border rounded-full">
//               <thead className="p-8 bg-primary-bg border border-primary-fg bg-opacity-35">
//                 <tr className="p-8 bg-primary-accent/50  ">
//                   <th className="py-3 border-b">No</th>
//                   <th className="py-3 border-b">Tanggal</th>
//                   <th className="py-3 border-b">Kategori</th>
//                   <th className="py-3 border-b">Judul</th>
//                   <th className="py-3 border-b">Jumlah</th>
//                   <th className="py-3 border-b">Status</th>
//
//                 </tr>
//               </thead>
//               <tbody>
//                 {loading ? (
//                   <tr>
//                     <td colSpan={7} className="p-4 text-center">
//                       Loading...
//                     </td>
//                   </tr>
//                 ) : paginatedData && donations.length > 0 ? (
//                   donations.map((row, index) => (
//                     <tr key={index} className="text-center  ">
//                       <td className="p-4 border-b">
//                         {(paginatedData.current_page - 1) *
//                           paginatedData.per_page +
//                           index +
//                           1}
//                       </td>
//                       <td className="p-4 border-b">
//                         {formatDate(row.created_at)}
//                       </td>
//                       <td className="p-4 border-b">{row.type}</td>
//                       <td className="p-4 border-b font-bold">
//                         {row.donor_donation.donation.title}
//                       </td>
//                       <td className="p-4 border-b">
//                         {row.type === "Funds"
//                           ? `${formatter.format((row as Fund).amount)}`
//                           : `${(row as Item).product_amount} Produk`}
//                       </td>
//                       <td className="p-4 border-b capitalize">
//                         <span
//                           className={`px-2 py-1 rounded text-sm font-medium ${
//                             row.status === "finished"
//                               ? "bg-green-600 text-white"
//                               : "bg-yellow-500 text-black"
//                           }`}
//                         >
//                           {formatStatus(row.status)}
//                         </span>
//                       </td>
//                       {/* <td className="p-4 border-b">
//                                                 {row.type === "Funds" ? (
//                                                     <a
//                                                         target="_blank"
//                                                         rel="noopener noreferrer"
//                                                         href={(row as Fund).redirect_url}
//                                                         className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
//                                                     >
//                                                         Detail
//                                                     </a>
//                                                 ) : (
//                                                     <span className="text-gray-400">-</span>
//                                                 )}
//                                             </td> */}
//                     </tr>
//                   ))
//                 ) : (
//                   <tr>
//                     <td colSpan={7} className="p-4 text-center text-white">
//                       Riwayat Donasi Kosong
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//           {paginatedData && (
//             <div className="flex justify-between items-center sticky bottom-0 z-9 w-full py-4 bg-primary-bg border-primary-fg">
//               {paginatedData.prev_page_url ? (
//                 <button
//                   onClick={() => setPage(paginatedData.current_page - 1)}
//                   className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
//                 >
//                   Previous
//                 </button>
//               ) : (
//                 <span className="px-4 py-2 bg-gray-300 text-white rounded cursor-not-allowed">
//                   Previous
//                 </span>
//               )}

//               <span className="text-primary-fg">
//                 Halaman {paginatedData.current_page} dari{" "}
//                 {paginatedData.last_page}
//               </span>

//               {paginatedData.next_page_url ? (
//                 <button
//                   onClick={() => setPage(paginatedData.current_page + 1)}
//                   className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
//                 >
//                   Next
//                 </button>
//               ) : (
//                 <span className="px-4 py-2 bg-gray-300 text-white rounded cursor-not-allowed">
//                   Next
//                 </span>
//               )}
//             </div>
//           )}
//         </div>
//       </div>
//     </Authenticated>
//   );
// }
