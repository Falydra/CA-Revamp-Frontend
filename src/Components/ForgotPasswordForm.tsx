import { type FormEventHandler, useState } from "react";
import { AxiosError } from "axios";

import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import PrimaryButton from "@/Components/PrimaryButton";
import { apiService } from "@/services/api";

interface ForgotPasswordFormProps {
  setShowLoginForm: (val: boolean) => void;
  setShowForgotPasswordForm: (val: boolean) => void;
}

export default function ForgotPasswordForm({
  setShowLoginForm,
  setShowForgotPasswordForm,
}: ForgotPasswordFormProps) {
  const [errors, setErrors] = useState<{ 
    email?: string; 
    password?: string;
    password_confirmation?: string;
  }>({});
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [data, setData] = useState({
    email: "",
    password: "",
    password_confirmation: "",
  });

  const submit: FormEventHandler = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setErrors({});
    setSuccess(false);

    try {
      const response = await apiService.resetPassword({
        email: data.email,
        password: data.password,
        password_confirmation: data.password_confirmation,
      });

      if (response.success) {
        setSuccess(true);
        setData({ email: "", password: "", password_confirmation: "" });
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          setShowForgotPasswordForm(false);
          setShowLoginForm(true);
        }, 2000);
      }
    } catch (error) {
      const err = error as AxiosError;
      console.error("Reset password error:", err);

      if (err.response) {
        if (err.response.status === 422) {
          const responseData = err.response.data as {
            errors?: { 
              email?: string[]; 
              password?: string[];
              password_confirmation?: string[];
            };
            message?: string;
          };
          
          if (responseData.errors) {
            setErrors({
              email: responseData.errors.email?.[0],
              password: responseData.errors.password?.[0],
              password_confirmation: responseData.errors.password_confirmation?.[0],
            });
          } else {
            setErrors({ email: responseData.message || "Validation failed" });
          }
        } else if (err.response.status === 404) {
          setErrors({ email: "No account found with this email address" });
        } else {
          setErrors({ email: "Password reset failed. Please try again." });
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
      <h1 className="text-2xl font-bold text-blue-500">Reset Password</h1>
      <p className="text-sm text-blue-500 mb-8">
        Enter your email and new password to reset your account password
      </p>

      {success && (
        <div className="w-full p-4 mb-4 bg-green-100 border border-green-400 text-green-700 rounded">
          Password reset successfully! Redirecting to login...
        </div>
      )}

      <form onSubmit={submit} className="w-full">
        <div className="text-start text-blue-500">
          <InputLabel
            htmlFor="email"
            value="Email Address"
            className="text-primary-bg"
          />
          <TextInput
            id="email"
            type="email"
            name="email"
            value={data.email}
            className="mt-1 block w-full h-10 px-2 text-blue-500"
            placeholder="your@email.com"
            onChange={(e) => setData({ ...data, email: e.target.value })}
            required
          />
          <InputError message={errors.email} className="mt-2" />
        </div>

        <div className="text-start mt-4 text-blue-500">
          <InputLabel htmlFor="password" value="New Password" />
          <TextInput
            id="password"
            type="password"
            name="password"
            value={data.password}
            className="mt-1 block w-full h-10 px-2 text-blue-500"
            placeholder="Min. 8 characters"
            onChange={(e) => setData({ ...data, password: e.target.value })}
            required
          />
          <InputError message={errors.password} className="mt-2" />
        </div>

        <div className="text-start mt-4 text-blue-500">
          <InputLabel htmlFor="password_confirmation" value="Confirm New Password" />
          <TextInput
            id="password_confirmation"
            type="password"
            name="password_confirmation"
            value={data.password_confirmation}
            className="mt-1 block w-full h-10 px-2 text-blue-500"
            placeholder="Confirm your password"
            onChange={(e) => setData({ ...data, password_confirmation: e.target.value })}
            required
          />
          <InputError message={errors.password_confirmation} className="mt-2" />
        </div>

        <div className="flex items-center justify-end mt-6">
          <PrimaryButton
            className="w-full text-center items-center justify-center flex"
            disabled={processing || success}
          >
            <span className="px-3 text-sm text-indigo-50">
              {processing ? "Resetting..." : "Reset Password"}
            </span>
          </PrimaryButton>
        </div>

        <div className="text-center text-sm py-2 text-blue-300 ">
          Remember your password?{" "}
          <a
            onClick={() => {
              setShowForgotPasswordForm(false);
              setShowLoginForm(true);
            }}
            className="underline underline-offset-4 cursor-pointer hover:text-blue-500"
          >
            Back to Login
          </a>
        </div>
      </form>
    </>
  );
}
