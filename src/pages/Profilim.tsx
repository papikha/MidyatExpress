import { useEffect, useState, useRef } from "react";
import type { ChangeEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../redux/store";
import { getUser } from "../redux/slices/UserSlice";
import axios from "axios";
import { supabase } from "../../supabaseClient";
import { FaUserCircle, FaEdit, FaShoppingCart } from "react-icons/fa";
import { IoWallet } from "react-icons/io5";
import { IoIosRemoveCircle } from "react-icons/io";
import { RiAdminFill } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import NotFound from "../Components/NotFound";
import { useFormik } from "formik";
import * as Yup from "yup";

const passwordSchema = Yup.object({
  password: Yup.string()
    .min(6, "Yeni Şifreniz en az 6 karakter olmalı")
    .required("Lütfen Yeni Şifrenizi Giriniz"),
});

interface PassValues {
  password: string;
}

function Profilim() {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.user);
  const navigate = useNavigate();
  const walletRef = useRef<HTMLDivElement>(null);

  const [balanceOpen, setBalanceOpen] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [messageColor, setMessageColor] = useState<string | null>(null);

  useEffect(() => {
    dispatch(getUser());
  }, [dispatch]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        walletRef.current &&
        !walletRef.current.contains(event.target as Node)
      ) {
        setBalanceOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Çıkış Yapma
  const handleLogout = () => {
    if (window.confirm("Çıkış yapmak istediğinizden emin misiniz?")) {
      supabase.auth.signOut();
      navigate("/");
      window.location.reload();
    }
  };

  // Hesap silme
  const handleDeleteAccount = async () => {
    if (
      !window.confirm(
        "Hesabınızı kalıcı olarak silmek istediğinizden emin misiniz?"
      )
    )
      return;
    try {
      await axios.delete(`/api/users/${user?.id}`);
      navigate("/");
      window.location.reload();
    } catch (err) {
      console.error(err);
      setMessage("Hesap silinemedi!");
      setMessageColor("#f23f3f");
    }
  };

  // Avatar yükleme
  const handleAvatarChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    setPreview(URL.createObjectURL(file));
    const formData = new FormData();
    formData.append("avatar", file);
    formData.append("userId", user!.id);

    try {
      await axios.post("/api/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      dispatch(getUser());
      setMessage("Avatar yüklendi!");
      setMessageColor("#2bd92b");
      setPreview(null);
    } catch (err) {
      console.error(err);
      setMessage("Avatar yüklenemedi!");
      setMessageColor("#f23f3f");
    }
  };

  // Avatar silme
  const handleAvatarDelete = async () => {
    if (!window.confirm("Avatarı silmek istediğine emin misin?")) return;
    try {
      await axios.post("/api/profile/delete", { userId: user?.id });
      dispatch(getUser());
      setMessage("Avatar silindi!");
      setMessageColor("#f2d73f");
    } catch (err) {
      console.error(err);
      setMessage("Avatar silinemedi!");
      setMessageColor("#f23f3f");
    }
  };

  const formik = useFormik<PassValues>({
    initialValues: {
      password: "",
    },
    validationSchema: passwordSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        const { error } = await supabase.auth.updateUser({
          password: values.password,
        });
        if (error) throw error;
        setMessage("Şifre başarıyla değiştirildi!");
        setMessageColor("#2bd92b");
        formik.resetForm();
        setShowPasswordModal(false);
      } catch (err: any) {
        if (err.message.includes("New password should be different from the old password.")){
          setMessage("Hata: Lütfen Şu ankinden Farklı Bir Şifre Giriniz");
          setMessageColor("#f23f3f");
        }else{
        setMessage("Bilinmeyen bir Hata Oluştu Lütfen Daha Sonra Tekrar Deneyiniz");
        setMessageColor("#f23f3f");
        }
      } finally {
        setLoading(false);
      }
    },
  });

  const { values, errors, touched, handleChange, handleSubmit } = formik;

  if (!user?.id) return <NotFound />;

  return (
    <div className="w-screen h-screen bg-gradient-to-br from-blue-200 via-purple-200 to-pink-200 flex justify-center items-start overflow-auto p-4">
      <div className="w-full max-w-6xl min-w-[300px] bg-white shadow-2xl rounded-3xl flex flex-col gap-6 p-6 md:p-8 relative">
        {/* Wallet */}
        <div ref={walletRef} className="absolute top-4 right-4 z-50">
          <div className="relative">
            <button
              onClick={() => setBalanceOpen(!balanceOpen)}
              className="w-12 h-12 rounded-full bg-white flex items-center justify-center hover:bg-yellow-100 border border-white/40 shadow"
            >
              <IoWallet className="w-[70%] h-[70%]" />
            </button>
            {balanceOpen && (
              <div className="absolute top-full right-0 mt-2 bg-yellow-200 text-yellow-900 text-sm font-semibold px-3 py-1 rounded-xl shadow-md">
                <span>₺{user.balance}</span>
              </div>
            )}
          </div>
        </div>

        {/* Profil */}
        <div className="flex flex-col md:flex-row items-start gap-6">
          <div className="relative flex-shrink-0">
            {preview ? (
              <img
                src={preview}
                alt="Preview"
                className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover border-4 border-white shadow-lg"
              />
            ) : user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt="Avatar"
                className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover border-4 border-white shadow-lg"
              />
            ) : (
              <FaUserCircle className="w-32 h-32 sm:w-40 sm:h-40 text-gray-400 border-4 border-white shadow-lg rounded-full" />
            )}

            {user.avatar_url ? (
              <button
                onClick={handleAvatarDelete}
                className="flex justify-center items-center absolute top-0 right-0 bg-red-500 text-white rounded-full w-[30px] h-[30px] hover:bg-red-600 shadow-md max-sm:w-5 max-sm:h-5"
              >
                <IoIosRemoveCircle className="sm:w-6 sm:h-6" />
              </button>
            ) : (
              <button className="absolute top-0 right-0 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 shadow-md">
                <FaEdit />
                <input
                  type="file"
                  accept="image/webp, image/jpeg, image/png"
                  onChange={handleAvatarChange}
                  className="absolute top-0 right-0 w-12 h-12 cursor-pointer opacity-0 "
                />
              </button>
            )}
          </div>

          <div className="flex-1 flex flex-col justify-between h-full text-left">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">
              Merhaba, {user.user_name} 👋
            </h1>
            <p className="text-lg mb-2">
              <strong>Ad:</strong> {user.user_name}
            </p>
            <p className="text-lg mb-2">
              <strong>Email:</strong> {user.email}
            </p>
          </div>
        </div>

        {/* Butonlar */}
        <div className="flex flex-wrap gap-4 mt-6">
          <button
            onClick={() => setShowPasswordModal(true)}
            className="flex-1 min-w-[140px] bg-blue-500 text-white py-3 rounded-xl hover:bg-blue-600 shadow-md"
          >
            Şifreyi Değiştir
          </button>
          <button
            onClick={handleDeleteAccount}
            className="flex-1 min-w-[140px] bg-red-500 text-white py-3 rounded-xl hover:bg-red-600 shadow-md"
          >
            Hesabı Sil
          </button>
          <button
            onClick={handleLogout}
            className="flex-1 min-w-[140px] bg-gray-500 text-white py-3 rounded-xl hover:bg-gray-600 shadow-md"
          >
            Çıkış Yap
          </button>
          <button
            onClick={() => navigate("/sepetim")}
            className="flex-1 min-w-[140px] bg-green-500 text-white py-3 rounded-xl hover:bg-green-600 shadow-md flex items-center justify-center gap-2"
          >
            <FaShoppingCart /> <span>Sepete Git</span>
          </button>
          {user.is_admin && (
            <button
              onClick={() => navigate("/panel")}
              className="flex-1 min-w-[140px] bg-green-700 text-white py-3 rounded-xl hover:bg-green-600 shadow-md flex items-center justify-center gap-2"
            >
              <RiAdminFill /> <span>Admin Paneli</span>
            </button>
          )}
        </div>
      </div>

      {/* Şifre Değiştirme Modal */}
      {showPasswordModal && (
        <form
          onSubmit={handleSubmit}
          className="fixed inset-0 bg-black/40 flex justify-center items-center z-50"
        >
          <div className="bg-white rounded-2xl p-6 w-[90%] max-w-md shadow-lg text-center">
            <h2 className="text-xl font-semibold mb-4">Yeni Şifre Belirle</h2>
            <input
              name="password"
              type="password"
              placeholder="Yeni şifre"
              value={values.password}
              onChange={handleChange}
              className="border border-gray-300 rounded-lg w-full px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {errors.password && touched.password && (
              <p className="text-sm text-red-500 mb-3">{errors.password}</p>
            )}
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50"
              >
                {loading ? "Kaydediliyor..." : "Kaydet"}
              </button>
            </div>
          </div>
        </form>
      )}
      {message && (
        <div className="fixed bg-gray-200 hover:bg-gray-400 bottom-4 left-1/2 transform -translate-x-1/2 flex items-center max-w-lg w-full rounded-xl shadow-lg overflow-hidden transition-colors">
          {/* Mesaj kısmı */}
          <div
            style={{
              background: `${messageColor}`,
            }}
            className="flex-1 px-6 py-4 font-semibold text-lg"
          >
            {message}
          </div>

          {/* Tamam butonu */}
          <button
            onClick={() => setMessage(null)}
            className="px-5 py-3 text-gray-700 font-semibold transition-colors"
          >
            Tamam
          </button>
        </div>
      )}
    </div>
  );
}

export default Profilim;
