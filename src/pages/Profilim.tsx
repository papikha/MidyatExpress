import { useEffect, useState, useRef } from "react";
import type { ChangeEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../redux/store";
import { clearUser, getUser } from "../redux/slices/UserSlice";
import axios from "axios";
import { supabase } from "../../supabaseClient";
import { PiUploadSimpleBold } from "react-icons/pi";
import { FaUserCircle, FaShoppingCart, FaUserLock } from "react-icons/fa";
import { IoWallet } from "react-icons/io5";
import { MdLogout, MdNoAccounts } from "react-icons/md";
import { IoIosRemoveCircle } from "react-icons/io";
import { RiAdminFill } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import NotFound from "../Components/NotFound";
import { useFormik } from "formik";
import * as Yup from "yup";
import MessageBox from "../Components/MessageBox";
import { setMessage } from "../redux/slices/MessageSlice";
import ConfirmBox from "../Components/ConfirmBox";
import MessageButton from "../Components/MessageButton";
import { TiArrowBack } from "react-icons/ti";

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
  const [confirmMessage, setConfirmMessage] = useState<string | null>(null);
  const [onConfirm, setOnConfirm] = useState<(() => void) | null>(null);
  const { message } = useSelector((state: RootState) => state.message);
  const navigate = useNavigate();
  const walletRef = useRef<HTMLDivElement>(null);
  const [balanceOpen, setBalanceOpen] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

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

  //* Çıkış Yapma
  const handleLogout = () => {
    setConfirmMessage(
      "Hesabınızıdan Çıkış yapmak istediğinizden emin misiniz?"
    );
    setOnConfirm(() => async () => {
      await supabase.auth.signOut();
      dispatch(
        setMessage({
          message: "Hesabınızdan Çıkış Yaptınız",
          messageColor: "#f2d73f",
        })
      );
      dispatch(clearUser());
      setConfirmMessage(null);
      setOnConfirm(null);
      navigate("/");
    });
  };

  //* Hesap silme
  const handleDeleteAccount = async () => {
    setConfirmMessage(
      "Bu Hesabı Kalıcı Olarak Silmek İstediğinizden Emin misiniz?"
    );
    setOnConfirm(() => async () => {
      try {
        await axios.delete(`/api/users/${user?.id}`);
        dispatch(
          setMessage({
            message: "Hesap Kalıcı Olarak Silindi",
            messageColor: "#f23f3f",
          })
        );
        dispatch(clearUser());
        setConfirmMessage(null);
        setOnConfirm(null);
        navigate("/");
      } catch (err) {
        console.error(err);
        dispatch(
          setMessage({ message: "Hesap silinemedi", messageColor: "#f23f3f" })
        );
      }
    });
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
      dispatch(
        setMessage({
          message: "Avatar Başarıyla Yüklendi!",
          messageColor: "#2bd92b",
        })
      );
      setPreview(null);
    } catch (err) {
      console.error(err);
      dispatch(
        setMessage({
          message: "Avatar Yüklerken Bir Sorun Oluştu",
          messageColor: "#f23f3f",
        })
      );
    }
  };

  // Avatar silme
  const handleAvatarDelete = async () => {
    setConfirmMessage("Avatarı silmek istediğine emin misin?");
    setOnConfirm(() => async () => {
      try {
        await axios.post("/api/profile/delete", { userId: user?.id });
        dispatch(getUser());
        dispatch(
          setMessage({
            message: "Avatar Başarıyla Silindi!",
            messageColor: "#2bd92b",
          })
        );
        setConfirmMessage(null);
        setOnConfirm(null);
      } catch (err) {
        console.error(err);
        dispatch(
          setMessage({
            message: "Avatar Silerken Bir Sorun Oluştu",
            messageColor: "#f23f3f",
          })
        );
      }
    });
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
        dispatch(
          setMessage({
            message: "Şifre başarıyla değiştirildi!",
            messageColor: "#2bd92b",
          })
        );
        formik.resetForm();
        setShowPasswordModal(false);
      } catch (err: any) {
        if (
          err.message.includes(
            "New password should be different from the old password."
          )
        ) {
          dispatch(
            setMessage({
              message: "Hata: Lütfen Şu ankinden Farklı Bir Şifre Giriniz",
              messageColor: "#f23f3f",
            })
          );
        } else {
          dispatch(
            setMessage({
              message:
                "Bilinmeyen bir Hata Oluştu Lütfen Daha Sonra Tekrar Deneyiniz",
              messageColor: "#f23f3f",
            })
          );
        }
      } finally {
        setLoading(false);
      }
    },
  });

  const { values, errors, touched, handleChange, handleSubmit } = formik;


  if (!user) return <NotFound/>;
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-200 via-sky-200 to-pink-200 flex justify-center items-start p-4 sm:p-6">
      <div
        onClick={() => navigate("/")}
        className="md:hidden fixed z-1000 flex left-2 items-center justify-center w-11 h-11 rounded-full bg-white/80 backdrop-blur-md shadow-lg cursor-pointer hover:scale-110 hover:shadow-xl active:scale-95 transition-all duration-300"
      >
        <TiArrowBack className="w-6 h-6 text-gray-700" />
      </div>
      <div className="relative w-full max-w-6xl bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_30px_80px_rgba(0,0,0,0.18)] p-6 sm:p-10 space-y-10">
        {/* Wallet */}
        <div ref={walletRef} className="absolute top-5 right-5 z-50">
          <button
            onClick={() => setBalanceOpen(!balanceOpen)}
            className="w-12 h-12 rounded-full bg-white shadow-md hover:shadow-xl transition flex items-center justify-center"
          >
            <IoWallet className="w-6 h-6" />
          </button>

          {balanceOpen && (
            <div className="absolute right-0 mt-2 bg-yellow-300 text-yellow-900 px-4 py-1 rounded-xl text-sm font-semibold shadow-lg">
              ₺{user.balance}
            </div>
          )}
        </div>

        {/* Profil Header */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
          <div className="relative group">
            {preview ? (
              <img
                src={preview}
                className="w-36 h-36 sm:w-44 sm:h-44 rounded-full object-cover ring-4 ring-white shadow-xl"
              />
            ) : user.avatar_url ? (
              <img
                src={user.avatar_url}
                className="w-36 h-36 sm:w-44 sm:h-44 rounded-full object-cover ring-4 ring-white shadow-xl"
              />
            ) : (
              <FaUserCircle className="w-36 h-36 sm:w-44 sm:h-44 text-gray-400 ring-4 ring-white shadow-xl rounded-full" />
            )}

            {user.avatar_url ? (
              <button
                onClick={handleAvatarDelete}
                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-2 shadow-lg hover:bg-red-600 transition"
              >
                <IoIosRemoveCircle className="w-5 h-5" />
              </button>
            ) : (
              <label className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-3 py-2 rounded-full text-sm shadow-lg cursor-pointer hover:bg-blue-600 transition">
                <PiUploadSimpleBold />
                <input
                  type="file"
                  accept="image/webp, image/jpeg, image/png"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          <div className="flex-1 text-center md:text-left space-y-3">
            <h1 className="text-3xl sm:text-4xl font-bold">
              Merhaba, {user.user_name}
            </h1>
            <p className="text-gray-700 text-lg">
              <strong>Ad:</strong> {user.user_name}
            </p>
            <p className="text-gray-700 text-lg">
              <strong>Email:</strong> {user.email}
            </p>
          </div>
        </div>

        {/**/}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            onClick={() => navigate("/sepetim")}
            className="flex items-center gap-3 bg-emerald-500 text-white py-4 rounded-2xl shadow-lg hover:scale-[1.03] hover:bg-emerald-600 transition"
          >
            <FaShoppingCart className="w-6 h-6 ml-5" />
            <span className="font-semibold">Sepete Git</span>
          </button>

          <button
            onClick={() => setShowPasswordModal(true)}
            className="flex items-center gap-3 bg-blue-500 text-white py-4 rounded-2xl shadow-lg hover:scale-[1.03] hover:bg-blue-600 transition"
          >
            <FaUserLock className="w-6 h-6 ml-5" />
            <span className="font-semibold">Şifreyi Değiştir</span>
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 bg-gray-500 text-white py-4 rounded-2xl shadow-lg hover:scale-[1.03] hover:bg-gray-600 transition"
          >
            <MdLogout className="w-6 h-6 ml-5" />
            <span className="font-semibold">Çıkış Yap</span>
          </button>

          <button
            onClick={handleDeleteAccount}
            className="flex items-center gap-3 bg-red-500 text-white py-4 rounded-2xl shadow-lg hover:scale-[1.03] hover:bg-red-600 transition"
          >
            <MdNoAccounts className="w-6 h-6 ml-5" />
            <span className="font-semibold">Hesabı Sil</span>
          </button>

          {user.is_admin && (
            <button
              onClick={() => navigate("/panel")}
              className="flex items-center gap-3 bg-indigo-600 text-white py-4 rounded-2xl shadow-lg hover:scale-[1.03] hover:bg-indigo-700 transition"
            >
              <RiAdminFill className="w-6 h-6 ml-5" />
              <span className="font-semibold">Admin Paneli</span>
            </button>
          )}
        </div>

        {showPasswordModal && (
          <form
            onSubmit={handleSubmit}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <div className="bg-white rounded-2xl p-6 w-[90%] max-w-md shadow-xl">
              <h2 className="text-xl font-bold mb-4 text-center">
                Yeni Şifre Belirle
              </h2>

              <input
                name="password"
                type="password"
                value={values.password}
                onChange={handleChange}
                placeholder="Yeni şifre"
                className="w-full border rounded-lg px-3 py-2 mb-3 focus:ring-2 focus:ring-blue-400 outline-none"
              />

              {errors.password && touched.password && (
                <p className="text-sm text-red-500 mb-3">{errors.password}</p>
              )}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"
                >
                  {loading ? "Kaydediliyor..." : "Kaydet"}
                </button>
              </div>
            </div>
          </form>
        )}

        {message && <MessageBox />}
        {confirmMessage && onConfirm && (
          <ConfirmBox
            confirmMessage={confirmMessage}
            onConfirm={onConfirm}
            onCancel={() => {
              setConfirmMessage(null);
              setOnConfirm(null);
            }}
          />
        )}
      </div>
      {user?.id ? <MessageButton where="bottom" /> : ""}
    </div>
  );
}

export default Profilim;
