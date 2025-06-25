import { useState } from "react";
import { motion } from "framer-motion";
import {Link } from "react-router-dom";
import Layout from "@/Components/Layout";
import LoginForm from "@/Components/LoginForm";
import RegisterForm from "@/Components/RegisterForm";


export default function Login() {
  const [showLoginForm, setShowLoginForm] = useState(true);
  const [showSignUpForm, setShowSignUpForm] = useState(false);
 
  

  return (
    <Layout>
      <div className="h-screen overflow-y-hidden font-sans w-full flex items-center justify-center flex-col gap-2">
      
        <Link to="/" className="text-xl cursor-pointer font-bold text-center bg-gradient-to-br from-blue-500 to-blue-100 bg-clip-text text-transparent ">
          Caritas Aeterna
        </Link>
        <div className="w-4/12 h-4/5 flex flex-col items-center justify-center bg-indigo-50/50 rounded-md shadow-lg p-8">
          {showLoginForm && (
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex w-4/5 h-full flex-col items-center justify-center text-center"
            >
             
              <LoginForm setShowLoginForm={setShowLoginForm}
                setShowSignUpForm={setShowSignUpForm}/>
            </motion.div>
          )}

          {showSignUpForm && (
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex w-4/5 h-full flex-col items-center justify-center text-center"
            >
              <h1 className="text-2xl font-bold text-blue-500">Register</h1>
              <p className="text-sm text-blue-300 mb-4">Let's create your account!</p>
              <RegisterForm
                setShowLoginForm={setShowLoginForm}
                setShowSignUpForm={setShowSignUpForm}
              />
              
            </motion.div>
          )}
        </div>
      </div>
    </Layout>
  );
}
