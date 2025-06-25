import { type FormEventHandler, useState } from "react";
import axios, { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";

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
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState(false);
  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    agree: false,
  });

  const navigate = useNavigate();

  const submit: FormEventHandler = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setErrors({});

    try {
      await axios.get(`${import.meta.env.VITE_BACKEND_URL}/sanctum/csrf-cookie`, {
        withCredentials: true,
      });

      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/register`,
        {
          name: data.name,
          email: data.email,
          password: data.password,
          password_confirmation: data.password_confirmation,
        },
        {
          withCredentials: true,
        }
      );

      navigate("/welcome");
    } catch (error) {
      const err = error as AxiosError;
      if (err.response && err.response.data) {
        setErrors(err.response.data as Record<string, string>);
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
          className="mt-1 block w-full h-10 px-2 text-blue-500"
          onChange={(e) => setData({ ...data, name: e.target.value })}
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
          className="mt-1 block w-full h-10 px-2 text-blue-500"
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
          onChange={(e) => setData({ ...data, password: e.target.value })}
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
          className="mt-1 block w-full h-10 px-2 text-blue-500"
          onChange={(e) =>
            setData({ ...data, password_confirmation: e.target.value })
          }
        />
        <InputError message={errors.password_confirmation} className="mt-2" />
      </div>

     

      <div className="flex items-center justify-end mt-4">
        <PrimaryButton className="w-full text-center items-center justify-center flex" disabled={processing}>
          <span className="px-3 text-sm text-indigo-50">Register</span>
        </PrimaryButton>
      </div>

      <div className="text-center text-sm py-2 text-blue-300 ">
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
