import Authenticated from "@/Layout/AuthenticatedLayout";
import { Link } from "react-router-dom";
import { FaRegEdit, FaTrashAlt } from "react-icons/fa";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
} from "@/Components/ui/dropdown-menu";
import { Button } from "@/Components/ui/button";
import { PiDotsThreeBold } from "react-icons/pi";

const handleDelete = (id: string | undefined) => {
  if (confirm("Are you sure you want to delete this user?")) {
    
    console.log("Delete user:", id);
  }
};

export default function ManageUsers() {
  
  const user = {
    data: [],
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
    next_page_url: null,
    prev_page_url: null,
  };

  console.log(user);
  console.log(user.next_page_url);
  console.log(user.prev_page_url);

  return (
    <Authenticated>
      <div className="flex w-full flex-col max-h-screen items-start justify-start px-8 py-4 bg-primary-bg gap-4">
        <h1 className="text-2xl font-bold">User Manager</h1>
        <div className="flex justify-between items-center w-full">
          <p className="text-lg">Manage all users in the system.</p>

          <Link
            to="/super-admin/manage-users/create-user-form"
            className="px-4 py-2 bg-primary-accent text-white rounded"
          >
            Tambah Admin
          </Link>
        </div>
        <div className="flex flex-col w-full items-center justify-center">
          <div className="w-full max-h-[375px] overflow-y-auto rounded-md ">
            <table className="w-full text-center border rounded-full">
              <thead className="p-8 bg-primary-bg border border-primary-fg bg-opacity-35">
                <tr className="p-8 bg-primary-accent/50  ">
                  <th className="py-3 border-b border-primary-fg ">No</th>
                  <th className="py-3 border-b border-primary-fg">ID</th>
                  <th className="py-3 border-b border-primary-fg">Name</th>
                  <th className="py-3 border-b border-primary-fg">Email</th>
                  <th className="py-3 border-b border-primary-fg">Role</th>
                  <th className="py-3 border-b border-primary-fg">Aksi</th>
                </tr>
              </thead>
              <tbody className="text-center">
                {user?.data?.map((item, index) => (
                  <tr key={item.user_id} className="text-center">
                    <td className="p-4 border-b">
                      {(user.current_page - 1) * user.per_page + index + 1}
                    </td>
                    <td className="p-4 border-b">{item.user_id}</td>
                    <td className="p-4 border-b">{item.name}</td>
                    <td className="p-4 border-b">{item.email}</td>
                    <td className="p-4 border-b">{item.role}</td>
                    <td className="p-4 border-b ">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild className="w-full h-full">
                          <Button
                            className="w-8 h-8 aspect-square rounded-full"
                            variant={"ghost"}
                          >
                            <PiDotsThreeBold className="w-4 h-4 aspect-square self-center" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-48 mr-12">
                          <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuGroup>
                            <Link
                              to={`/super-admin/manage-users/edit/${item.user_id}`}
                              className="flex justify-between w-full h-8 items-center bg-transparent hover:bg-primary-accent/65 rounded-md text-primary-bg px-2 font-semibold text-sm "
                            >
                              Edit
                              <FaRegEdit className="w-4 h-4 aspect-square " />
                            </Link>
                            <button
                              onClick={() => handleDelete(item.user_id)}
                              className="flex justify-between w-full h-8 items-center bg-transparent hover:bg-red-300 rounded-md text-red-600 px-2 font-semibold text-sm"
                            >
                              Hapus
                              <FaTrashAlt className="w-4 h-4 aspect-square" />
                            </button>
                          </DropdownMenuGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className=" flex justify-between items-center sticky bottom-0 z-9 w-full">
          {user.prev_page_url ? (
            <Link
              to={`/super-admin/manage-users?page=${user.current_page - 1}`}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Previous
            </Link>
          ) : (
            <span className="px-4 py-2 bg-gray-300 text-white rounded cursor-not-allowed">
              Previous
            </span>
          )}
          <span>
            Halaman {user.current_page} dari {user.last_page}
          </span>
          {user.next_page_url ? (
            <Link
              to={`/super-admin/manage-users?page=${user.current_page + 1}`}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Next
            </Link>
          ) : (
            <span className="px-4 py-2 bg-gray-300 text-white rounded cursor-not-allowed">
              Next
            </span>
          )}
        </div>
      </div>
    </Authenticated>
  );
}
