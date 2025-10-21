import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useFormik } from "formik";
import { regSchema } from "../schemas/RegSchema";
import setTypeState from "../hooks/SetTypeState";
import { supabase } from "../../supabaseClient";
import axios from "axios";

interface RegisterValues {
  userName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

function Register() {
  const navigate = useNavigate();
  const [type, eye, setTypeFunc] = setTypeState();
  const [type2, eye2, setTypeFunc2] = setTypeState();
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [loadingText, setLoadingText] = useState<string>("Kayıt Ol");

const submit = async (values: RegisterValues) => {
  setLoadingText("Kayıt Olunuyor...");
  setErrorMessage("");

  try {
    const response = await axios.post("/api/register", {
      user_name: values.userName,
      email: values.email,
      password: values.password,
    });

    setLoadingText("Kayıt Başarılı!");
    navigate("/Onay");
  } catch (err: any) {
    if (err.response?.data?.error.includes("users_email_key")){
      setErrorMessage("Bu email adresi zaten kayıtlı");
    }else if (err.response?.data?.error.includes("users_user_name_key")){
      setErrorMessage("Bu isimde başka kullanıcı kayıtlı");
    } else{
      setErrorMessage(err.response?.data?.error || "Bir hata oluştu.");
    }
    
    setLoadingText("Kayıt Ol");
  }
};


  const formik = useFormik<RegisterValues>({
    initialValues: {
      userName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema: regSchema,
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

        {/* Username */}
        <div>
          <label className="font-medium text-gray-700">Kullanıcı Adı</label>
          <input
            name="userName"
            value={values.userName}
            onChange={handleChange}
            placeholder="Kullanıcı adınızı giriniz"
            className={`w-full border rounded-md px-4 py-2 mt-1 focus:outline-none focus:ring-2 ${
              errors.userName && touched.userName
                ? "border-red-400 focus:ring-red-300"
                : "border-indigo-300 focus:ring-indigo-400"
            }`}
          />
          {errors.userName && touched.userName && (
            <p className="text-sm text-red-500 mt-1">{errors.userName}</p>
          )}
        </div>

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

        {/* Confirm Password */}
        <div className="relative">
          <label className="font-medium text-gray-700">
            Şifreyi Doğrulayın
          </label>
          <input
            name="confirmPassword"
            type={type2}
            value={values.confirmPassword}
            onChange={handleChange}
            placeholder="Şifrenizi tekrar giriniz"
            className={`w-full border rounded-md px-4 py-2 mt-1 focus:outline-none focus:ring-2 ${
              errors.confirmPassword && touched.confirmPassword
                ? "border-red-400 focus:ring-red-300"
                : "border-indigo-300 focus:ring-indigo-400"
            }`}
          />
          <div className="absolute top-[38px]  right-3 text-gray-600 cursor-pointer">
            {eye2 ? (
              <FaEyeSlash size={20} onClick={setTypeFunc2} />
            ) : (
              <FaEye size={20} onClick={setTypeFunc2} />
            )}
          </div>
          {errors.confirmPassword && touched.confirmPassword && (
            <p className="text-sm text-red-500 mt-1">
              {errors.confirmPassword}
            </p>
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
          Zaten hesabın var mı?{" "}
          <span
            onClick={() => navigate("/Giriş")}
            className="text-indigo-600 hover:underline cursor-pointer"
          >
            Giriş yap
          </span>
        </p>
      </form>
    </div>
  );
}

export default Register;
