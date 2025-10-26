import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useFormik } from "formik";
import { loginSchema } from "../schemas/LoginSchema";
import setTypeState from "../hooks/SetTypeState";
import { supabase } from "../../supabaseClient";
import MessageBox from "./MessageBox";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../redux/store";
import { setMessage } from "../redux/slices/MessageSlice";

interface LoginValues {
  email: string;
  password: string;
}

function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { message } = useSelector((state: RootState) => state.message);
  const [type, eye, setTypeFunc] = setTypeState();
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [loadingText, setLoadingText] = useState<string>("Giriş Yap");

  const submit = async (values: LoginValues) => {
    setLoadingText("Giriş Yapılıyor...");
    setErrorMessage("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });

    if (error) {
      if (error.message.includes("Email not confirmed")){
        setErrorMessage("Email adresi doğrulanmamış");
      }else if (error.message.includes("Invalid login credentials")){
        setErrorMessage("Giriş yapmaya çalıştığınız bilgilerden biri ve ya ikisi yanlış");
      }else{
        setErrorMessage(error.message); 
      }
      
      setLoadingText("Giriş Yap");
    } else {
      localStorage.setItem("sb_token", data.session.access_token);
      setLoadingText("Giriş Başarılı!");
      dispatch(setMessage({message: "Başarıyla Giriş Yaptınız", messageColor: "#2bd92b"}))
      navigate("/");
    }
  };

  const formik = useFormik<LoginValues>({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: loginSchema,
    onSubmit: submit,
  });

  const { values, errors, touched, handleChange, handleSubmit } = formik;

  return (
    <div className="flex justify-center items-center w-full h-screen bg-gradient-to-br from-blue-300 via-indigo-200 to-purple-300">
      <form
        onSubmit={handleSubmit}
        className="bg-white/80 backdrop-blur-md p-8 sm:p-10 rounded-2xl shadow-lg w-full max-w-md flex flex-col gap-5"
      >
        <h2 className="text-2xl font-semibold text-center text-indigo-700">
          {loadingText}
        </h2>

        {/* Email */}
        <div>
          <label className="font-medium text-gray-700">Email</label>
          <input
            name="email"
            value={values.email}
            onChange={handleChange}
            placeholder="Email adresinizi giriniz"
            className={`w-full border rounded-md px-4 py-2 mt-1 focus:outline-none focus:ring-2 ${
              errors.email && touched.email
                ? "border-red-400 focus:ring-red-300"
                : "border-indigo-300 focus:ring-indigo-400"
            }`}
          />
          {errors.email && touched.email && (
            <p className="text-sm text-red-500 mt-1">{errors.email}</p>
          )}
        </div>

        {/* Password */}
        <div className="relative">
          <label className="font-medium text-gray-700">Şifre</label>
          <input
            name="password"
            type={type}
            value={values.password}
            onChange={handleChange}
            placeholder="Şifrenizi giriniz"
            className={`w-full border rounded-md px-4 py-2 mt-1 focus:outline-none focus:ring-2 ${
              errors.password && touched.password
                ? "border-red-400 focus:ring-red-300"
                : "border-indigo-300 focus:ring-indigo-400"
            }`}
          />
          <div className="absolute top-[38px] right-3 text-gray-600 cursor-pointer">
            {eye ? (
              <FaEyeSlash size={20} onClick={setTypeFunc} />
            ) : (
              <FaEye size={20} onClick={setTypeFunc} />
            )}
          </div>
          {errors.password && touched.password && (
            <p className="text-sm text-red-500 mt-1">{errors.password}</p>
          )}
        </div>

        {/* Error message */}
        {errorMessage && (
          <p className="text-center text-red-500 font-medium">{errorMessage}</p>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold py-2 rounded-md hover:opacity-90 transition-all"
        >
          {loadingText}
        </button>

        <p className="text-center text-gray-700 text-sm mt-2">
          Hesabın yok mu?{" "}
          <span
            onClick={() => navigate("/Kayıt")}
            className="text-indigo-600 hover:underline cursor-pointer"
          >
            Kayıt ol
          </span>
        </p>
      </form>
      {message && (
        <MessageBox/>
      )}
    </div>
  );
}

export default Login;
