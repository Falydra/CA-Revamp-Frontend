import { type FormEventHandler, useState } from "react";
import { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";

import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import PrimaryButton from "@/Components/PrimaryButton";
import Checkbox from "@/Components/Checkbox";
import { apiService } from "@/services/api";

interface LoginFormProps {
  setShowLoginForm: (val: boolean) => void;
  setShowSignUpForm: (val: boolean) => void;
}

export default function LoginForm({
  setShowLoginForm,
  setShowSignUpForm,
}: LoginFormProps) {
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );
  const [processing, setProcessing] = useState(false);
  const [data, setData] = useState({
    email: "",
    password: "",
    remember: false,
  });

  const navigate = useNavigate();

  const submit: FormEventHandler = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setErrors({});

    try {
      
      const loginResponse = await apiService.login({
        email: data.email,
        password: data.password,
      });

      console.log("Login successful:", loginResponse);

      
      if (loginResponse.success && loginResponse.data) {
        const { user, token } = loginResponse.data;

       
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("roles", user.role || "donor");
        localStorage.setItem("auth_token", token);

        console.log("User data stored in localStorage");
      }

      
      navigate("/");
    } catch (error) {
      const err = error as AxiosError;
      console.error("Login error:", err);

      if (err.response) {
        console.log("Error response:", err.response.data);

        
        if (err.response.status === 422) {
          const responseData = err.response.data as {
            errors?: { email?: string; password?: string };
          };
          if (responseData.errors) {
            setErrors(responseData.errors);
          } else {
            setErrors({ email: "Invalid credentials" });
          }
        } else if (err.response.status === 401) {
          setErrors({ email: "Invalid credentials" });
        } else {
          setErrors({ email: "Login failed. Please try again." });
        }
      } else {
        
        setErrors({ email: "Network error. Please check your connection." });
      }
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
      <h1 className="text-2xl font-bold text-blue-500">Welcome Back</h1>
      <p className="text-sm text-blue-500 mb-8">
        Before you start, please sign in with your account!
      </p>
      <div className="flex items-center w-full my-6">
        <div className="flex-grow border-t border-blue-300" />
        <span className="px-3 text-sm text-blue-500">Continue with</span>
        <div className="flex-grow border-t border-blue-300" />
      </div>
      <form onSubmit={submit} className="w-full">
        <div className="text-start text-blue-500">
          <InputLabel htmlFor="email" value="Email" />
          <TextInput
            id="email"
            type="email"
            name="email"
            value={data.email}
            className="mt-1 block w-full h-10 px-2 text-blue-500"
            autoComplete="username"
            placeholder="admin@example.com"
            onChange={(e) => setData({ ...data, email: e.target.value })}
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
            className="mt-1 block w-full h-10 px-2 text-blue-500"
            autoComplete="current-password"
            placeholder="admin"
            onChange={(e) => setData({ ...data, password: e.target.value })}
          />
          <InputError message={errors.password} className="mt-2" />
        </div>

        <div className="flex flex-row w-full items-center justify-between ">
          <div className="block mt-4">
            <label className="flex items-center ">
              <Checkbox
                name="remember"
                checked={data.remember}
                onChange={(e) =>
                  setData({ ...data, remember: e.target.checked })
                }
              />
              <span className="ms-2 text-sm text-blue-300">Remember me</span>
            </label>
          </div>
          <div className="block mt-4">
            <span className="ms-2 text-sm cursor-pointer hover:text-blue-500 text-blue-300">
              Forgot password?
            </span>
          </div>
        </div>

        <div className="flex items-center justify-end mt-4">
          <PrimaryButton
            className="w-full text-center items-center justify-center flex"
            disabled={processing}
          >
            <span className="px-3 text-sm text-indigo-50">Login</span>
          </PrimaryButton>
        </div>
        <div className="text-center text-sm py-2 text-blue-300 ">
          Don&apos;t have an account?{" "}
          <a
            onClick={() => {
              setShowLoginForm(false);
              setShowSignUpForm(true);
            }}
            className="underline underline-offset-4 cursor-pointer hover:text-blue-500"
          >
            Sign up
          </a>
        </div>
      </form>
    </>
  );
}
