// import { Input } from "@/Components/ui/input";
// import Authenticated from "@/Layout/AuthenticatedLayout";
// import { User } from "@/types";
// import { Link } from "react-router-dom";
// import { useState } from "react";

// interface ProfilePageProps {
//   user: User;
//   auth: {
//     user: User;
//     roles: string;
//   };
//   [key: string]: any;
// }

// export default function Profile() {
//   // Get user data from localStorage
//   const storedUser = localStorage.getItem("user");
//   const user = storedUser ? JSON.parse(storedUser) : null;

//   console.log("User Profile", user);

//   const [data, setData] = useState({
//     username: user?.username || "",
//     email: user?.email || "",
//   });

//   const [processing, setProcessing] = useState(false);
//   const [errors, setErrors] = useState<{ [key: string]: string }>({});

//   function handleSubmit(e: React.FormEvent) {
//     e.preventDefault();
//     setProcessing(true);
//     // TODO: Implement profile update API call
//     console.log("Profile update:", data);
//     setProcessing(false);
//   }

//   return (
//     <Authenticated>
//       <div className="flex w-full justify-center items-center pt-8 bg-primary-bg text-white">
//         <div className="flex flex-col w-1/2 items-start self-center gap-4 px-8 py-4">
//           <div className="flex flex-col items-start w-full gap-1">
//             <h1 className="text-2xl font-bold self-center">Edit User</h1>
//             <p className="text-lg self-center">
//               Update your account details below
//             </p>
//           </div>

//           <form
//             onSubmit={handleSubmit}
//             className="w-full rounded-lg shadow-md flex flex-col gap-6 bg-primary-bg p-6 border border-white"
//           >
//             <div>
//               <label
//                 htmlFor="username"
//                 className="block text-sm font-medium text-white mb-1"
//               >
//                 Username
//               </label>
//               <input
//                 id="username"
//                 type="text"
//                 placeholder="Enter username"
//                 value={data.username}
//                 onChange={(e) => setData("username", e.target.value)}
//                 className="w-full p-2 border border-white rounded-md bg-transparent text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-accent"
//                 required
//               />
//               {errors.username && (
//                 <p className="text-red-500 text-xs mt-1">{errors.username}</p>
//               )}
//             </div>

//             <div>
//               <label
//                 htmlFor="email"
//                 className="block text-sm font-medium text-white mb-1"
//               >
//                 Email
//               </label>
//               <input
//                 id="email"
//                 type="email"
//                 placeholder="Enter email"
//                 value={data.email}
//                 onChange={(e) => setData("email", e.target.value)}
//                 className="w-full p-2 border border-white rounded-md bg-transparent text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-accent"
//                 required
//               />
//               {errors.email && (
//                 <p className="text-red-500 text-xs mt-1">{errors.email}</p>
//               )}
//             </div>

//             <button
//               type="submit"
//               disabled={processing}
//               className="w-full mt-2 px-4 py-2 bg-primary-accent text-white rounded-md disabled:opacity-70"
//             >
//               {processing ? "Saving..." : "Save Changes"}
//             </button>
//           </form>
//         </div>
//       </div>
//     </Authenticated>
//   );
// }
