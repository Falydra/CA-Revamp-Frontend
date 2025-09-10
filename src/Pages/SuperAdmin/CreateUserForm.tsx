import { Input } from "@/Components/ui/input";
import Authenticated from "@/Layout/AuthenticatedLayout";
import { Button } from "@/Components/ui/button";
import React, { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function CreateAdmin() {
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    role: "admin",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setErrors({});

    
    if (data.password !== data.password_confirmation) {
      setErrors({ password_confirmation: "Passwords do not match" });
      setProcessing(false);
      return;
    }

    try {
      
      console.log("Creating user:", data);

      
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success("Admin baru berhasil dibuat!");
      navigate("/super-admin/manage-users");
    } catch (error) {
      console.error("Error creating user:", error);
      toast.error("Failed to create user");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Authenticated>
      <div className="flex w-full justify-center items-center pt-8 bg-primary-bg text-white">
        <div className="flex flex-col w-1/2 items-start self-center gap-4 px-8 py-4">
          <div className="flex flex-col items-start w-full gap-1">
            <h1 className="text-2xl font-bold self-center">Tambah Admin</h1>
            <p className="text-lg self-center">
              Masukkan informasi yang dibutuhkan dengan benar
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="w-full rounded-lg shadow-md flex flex-col gap-6 bg-primary-bg p-6 border border-white"
          >
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-white mb-1"
              >
                Name
              </label>
              <Input
                id="name"
                type="text"
                placeholder="Masukkan Nama"
                value={data.name}
                onChange={(e) => setData({ ...data, name: e.target.value })}
                className="text-primary-fg focus:text-primary-fg"
                required
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-white mb-1"
              >
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Masukkan Email"
                value={data.email}
                onChange={(e) => setData({ ...data, email: e.target.value })}
                className="text-primary-fg focus:text-primary-fg"
                required
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-white mb-1"
              >
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Masukkan Password Baru"
                value={data.password}
                onChange={(e) => setData({ ...data, password: e.target.value })}
                className="text-primary-fg focus:text-primary-fg"
                required
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="password_confirmation"
                className="block text-sm font-medium text-white mb-1"
              >
                Confirm Password
              </label>
              <Input
                id="password_confirmation"
                type="password"
                placeholder="Konfirmasi Password Baru"
                value={data.password_confirmation}
                onChange={(e) =>
                  setData({ ...data, password_confirmation: e.target.value })
                }
                className="text-primary-fg focus:text-primary-fg"
                required
              />
              {errors.password_confirmation && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.password_confirmation}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="role"
                className="block text-sm font-medium text-white mb-1"
              >
                Role
              </label>
              <select
                id="role"
                value={data.role}
                onChange={(e) => setData({ ...data, role: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md text-primary-fg focus:text-primary-fg"
                required
              >
                <option value="admin">Admin</option>
                <option value="super_admin">Super Admin</option>
              </select>
              {errors.role && (
                <p className="text-red-500 text-xs mt-1">{errors.role}</p>
              )}
            </div>

            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={processing}
                className="flex-1 bg-primary-accent hover:bg-primary-accent/80"
              >
                {processing ? "Creating..." : "Create Admin"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/super-admin/manage-users")}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Authenticated>
  );
}
