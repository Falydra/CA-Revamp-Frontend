import { type FormEventHandler, useState } from "react";
import { apiService } from "@/services/api";
import { toast } from "sonner";

import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import PrimaryButton from "@/Components/PrimaryButton";

interface RegisterFormProps {
  setShowLoginForm: (val: boolean) => void;
  setShowSignUpForm: (val: boolean) => void;
}

export default function RegisterForm({
  setShowLoginForm,
  setShowSignUpForm,
}: RegisterFormProps) {
  const [errors, setErrors] = useState<Record<string, string | string[]>>({});
  const [processing, setProcessing] = useState(false);
  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    agree: false,
  });

  const submit: FormEventHandler = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setErrors({});

    
    const newErrors: Record<string, string> = {};
    
    if (!data.name.trim()) {
      newErrors.name = "Name is required";
    }
    
    if (!data.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(data.email)) {
      newErrors.email = "Email is invalid";
    }
    
    if (!data.password) {
      newErrors.password = "Password is required";
    } else if (data.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }
    
    if (!data.password_confirmation) {
      newErrors.password_confirmation = "Password confirmation is required";
    } else if (data.password !== data.password_confirmation) {
      newErrors.password_confirmation = "Passwords do not match";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setProcessing(false);
      return;
    }

    try {
      console.log("Sending registration data:", {
        username: data.name, 
        email: data.email,
        password: data.password,
        password_confirmation: data.password_confirmation,
      });

      const response = await apiService.register({
        username: data.name, 
        email: data.email,
        password: data.password,
        password_confirmation: data.password_confirmation,
      });

      console.log("Registration response:", response);

      if (response.success) {
        toast.success("Registration successful! Please login to continue.");
        setShowSignUpForm(false);
        setShowLoginForm(true);
      } else {
        toast.error(response.message || "Registration failed");
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      console.error("Error response:", error.response?.data);

      if (error.response?.status === 422) {
        
        const validationErrors = error.response.data?.errors || {};
        console.log("Validation errors:", validationErrors);
        
        
        const formattedErrors: Record<string, string> = {};
        Object.keys(validationErrors).forEach(key => {
          const errorValue = validationErrors[key];
          const displayKey = key === 'username' ? 'name' : key; 
          formattedErrors[displayKey] = Array.isArray(errorValue) ? errorValue[0] : errorValue;
        });
        
        setErrors(formattedErrors);
        
        if (error.response.data?.message) {
          toast.error(error.response.data.message);
        } else {
          toast.error("Please check your input and try again");
        }
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Registration failed. Please try again.");
      }
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={submit} className="w-full">
      <div className="text-start text-blue-500">
        <InputLabel htmlFor="name" value="Name" />
        <TextInput
          id="name"
          type="text"
          name="name"
          value={data.name}
          className="mt-1 block w-full h-10 px-2 text-black bg-blue-100/75"
          onChange={(e) => setData({ ...data, name: e.target.value })}
          required
        />
        <InputError message={errors.name} className="mt-2" />
      </div>

      <div className="text-start mt-4 text-blue-500">
        <InputLabel htmlFor="email" value="Email" />
        <TextInput
          id="email"
          type="email"
          name="email"
          value={data.email}
          className="mt-1 block w-full h-10 px-2 text-black bg-blue-100/75"
          onChange={(e) => setData({ ...data, email: e.target.value })}
          required
        />
        <InputError message={errors.email} className="mt-2" />
      </div>

      <div className="text-start mt-4 text-blue-500">
        <InputLabel htmlFor="password" value="Password" />
        <TextInput
          id="password"
          type="password"
          name="password"
          value={data.password}
          className="mt-1 block w-full h-10 px-2 text-black bg-blue-100/75"
          onChange={(e) => setData({ ...data, password: e.target.value })}
          required
        />
        <InputError message={errors.password} className="mt-2" />
      </div>

      <div className="text-start mt-4 text-blue-500">
        <InputLabel htmlFor="password_confirmation" value="Confirm Password" />
        <TextInput
          id="password_confirmation"
          type="password"
          name="password_confirmation"
          value={data.password_confirmation}
          className="mt-1 block w-full h-10 px-2 text-black bg-blue-100/75"
          onChange={(e) =>
            setData({ ...data, password_confirmation: e.target.value })
          }
          required
        />
        <InputError message={errors.password_confirmation} className="mt-2" />
      </div>

      <div className="flex items-center justify-end mt-4">
        <PrimaryButton
          className="w-full text-center items-center justify-center flex"
          disabled={processing}
        >
          <span className="px-3 text-sm text-indigo-50">
            {processing ? "Registering..." : "Register"}
          </span>
        </PrimaryButton>
      </div>

      <div className="text-center text-sm py-2 text-blue-300">
        Already have an account?{" "}
        <a
          onClick={() => {
            setShowSignUpForm(false);
            setShowLoginForm(true);
          }}
          className="underline underline-offset-4 cursor-pointer hover:text-blue-500"
        >
          Log in
        </a>
      </div>
    </form>
  );
}