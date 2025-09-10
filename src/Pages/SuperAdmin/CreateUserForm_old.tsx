import { Input } from "@/Components/ui/input";
import Authenticated from "@/Layout/AuthenticatedLayout";
import { User } from "@/types";
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
        role: "admin",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        try {
            
            console.log("Creating user:", data);
            
            
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            toast.success("User created successfully!");
            navigate("/super-admin/manage-users");
        } catch (error) {
            console.error("Error creating user:", error);
            toast.error("Failed to create user");
        } finally {
            setProcessing(false);
        }
    };
        password: "",
        password_confirmation: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route("super-admin.manage-users.create-user"), {
            onSuccess: () => {
                router.visit(route('super-admin.manage-users'));
                toast.success("Admin baru berhasil dibuat!.");
                reset(); 
            },
            onError: (formErrors) => {
                if (!flash?.error && !flash?.errors?.database) {
                    alert("Submission Error! Please check the form for errors.");
                }
                console.error("Form submission error:", formErrors);
            },
        });
    };

    return (
        <Authenticated>
            <Head title="Create Admin" />
            <div className="flex w-full justify-center items-center pt-8 bg-primary-bg text-white">
                <div className="flex flex-col  w-1/2 items-start self-center gap-4 px-8 py-4">
                    <div className="flex flex-col items-start w-full gap-1">
                        <h1 className="text-2xl font-bold self-center">Tambah Admin</h1>
                        <p className="text-lg self-center">Masukkan informasi yang dibutuhkan dengan benar</p>
                    </div>

                    <form onSubmit={handleSubmit} className="w-full rounded-lg shadow-md flex flex-col gap-6 bg-primary-bg p-6 border border-white text">
                        
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1 text-white">
                                Username
                            </label>
                            {/* <p className="text-xs text-gray-500 mb-2">
                                This will be used for login and display.
                            </p> */}
                            <Input
                                id="username"
                                type="text"
                                placeholder="Masukkan Username"
                                value={data.username}
                                onChange={(e) => setData("username", e.target.value)}
                                className={`text-primary-fg focus:text-primary-fg ${errors.username ? 'border-red-500' : ''}`}
                                required
                            />
                            {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1 text-white">
                                Email
                            </label>
                            {/* <p className="text-xs text-gray-500 mb-2">
                                This will be used for login and notifications.
                            </p> */}
                            <Input
                                id="email"
                                type="email"
                                placeholder="Masukkan Email"
                                value={data.email}
                                onChange={(e) => setData("email", e.target.value)}
                                className={`text-primary-fg focus:text-primary-fg ${errors.email ? 'border-red-500' : ''}`}
                                required
                            />
                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1 text-white">
                                Password
                            </label>
                            <p className="text-xs text-gray-500 mb-2">
                                Minimum 8 characters.
                            </p> 
                            <Input
                                id="password"
                                type="password"
                                placeholder="Masukkan Password Baru"
                                value={data.password}
                                onChange={(e) => setData("password", e.target.value)}
                                className={`text-primary-fg focus:text-primary-fg ${errors.password ? 'border-red-500' : ''}`}
                                required
                            />
                            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                        </div>

                        <div>
                            <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 mb-1 text-white ">
                                Confirm Password
                            </label>
                            <Input
                                id="password_confirmation"
                                type="password"
                                placeholder="Konfirmasi Password Baru"
                                value={data.password_confirmation}
                                onChange={(e) => setData("password_confirmation", e.target.value)}
                                className="text-primary-fg focus:text-primary-fg"
                                required
                            />
                        </div>
                        <Button type="submit" disabled={processing} className="w-full mt-2 bg-primary-accent ">
                            {processing ? 'Creating...' : 'Create Admin'}
                        </Button>
                    </form>
                </div>
            </div>
        </Authenticated>
    );
}