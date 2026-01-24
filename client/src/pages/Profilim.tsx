import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../redux/store";
import { clearUser, getUser } from "../redux/slices/UserSlice";
import { supabase } from "../../supabaseClient";
import { PiUploadSimpleBold } from "react-icons/pi";
import { FaUserCircle, FaShoppingCart, FaUserLock } from "react-icons/fa";
import { MdEdit, MdLogout, MdNoAccounts, MdVerified } from "react-icons/md";
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
import api from "../api/axios";
import { CgCheck, CgInsertAfterO } from "react-icons/cg";

const passwordSchema = Yup.object({
  password: Yup.string()
    .min(6, "Yeni Şifreniz en az 6 karakter olmalı")
    .required("Lütfen Yeni Şifrenizi Giriniz"),
});

interface PassValues {
  password: string;
}

interface Listing {
  id: number;
  created_at: string;
  seller_id: string;
  listing_name: string;
  listing_price: number;
  listing_queue: number;
  listing_description: string;
  image_paths: JSON;
}

function Profilim() {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.user);
  const [confirmMessage, setConfirmMessage] = useState<string | null>(null);
  const [onConfirm, setOnConfirm] = useState<(() => void) | null>(null);
  const { message } = useSelector((state: RootState) => state.message);
  const navigate = useNavigate();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [openPhoneModal, setPhoneModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [timeLeft, setTimeLeft] = useState(60);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [listings, setListings] = useState<Listing[]>();
  const [userName, setUserName] = useState<string>("");
  const [userPlaceHolderName, setUserPlaceHolderName] = useState(
    user?.user_name,
  );
  const [name, setName] = useState<string>("");
  const [surname, setSurname] = useState<string>("");
  const [phone, setPhone] = useState<string>("");

  useEffect(() => {
    dispatch(getUser());
  }, [dispatch]);

  useEffect(() => {
    if (!openPhoneModal) return;

    if (timeLeft <= 0) {
      setPhoneModal(false);
      setOtp("");
      setTimeLeft(60);

      dispatch(
        setMessage({
          message: "Telefon doğrulanamadı",
          messageColor: "#f23f3f",
        }),
      );
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, openPhoneModal]);

  //* Çıkış Yapma
  const handleLogout = () => {
    setConfirmMessage(
      "Hesabınızıdan Çıkış yapmak istediğinizden emin misiniz?",
    );
    setOnConfirm(() => async () => {
      await supabase.auth.signOut();
      dispatch(
        setMessage({
          message: "Hesabınızdan Çıkış Yaptınız",
          messageColor: "#f2d73f",
        }),
      );
      dispatch(clearUser());
      setConfirmMessage(null);
      setOnConfirm(null);
      navigate("/");
    });
  };

  // *Avatar yükleme
  const handleAvatarChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    setPreview(URL.createObjectURL(file));
    const formData = new FormData();
    formData.append("avatar", file);
    formData.append("userId", user!.id);

    try {
      await api.post("/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      dispatch(getUser());
      dispatch(
        setMessage({
          message: "Avatar Başarıyla Yüklendi!",
          messageColor: "#2bd92b",
        }),
      );
      setPreview(null);
    } catch (err) {
      console.error(err);
      dispatch(
        setMessage({
          message: "Avatar Yüklerken Bir Sorun Oluştu",
          messageColor: "#f23f3f",
        }),
      );
    }
  };

  // *Avatar silme
  const handleAvatarDelete = async () => {
    setConfirmMessage("Avatarı silmek istediğine emin misin?");
    setOnConfirm(() => async () => {
      try {
        await api.delete("/profile");
        dispatch(getUser());
        dispatch(
          setMessage({
            message: "Avatar Başarıyla Silindi!",
            messageColor: "#2bd92b",
          }),
        );
        setConfirmMessage(null);
        setOnConfirm(null);
      } catch (err) {
        console.error(err);
        dispatch(
          setMessage({
            message: "Avatar Silerken Bir Sorun Oluştu",
            messageColor: "#f23f3f",
          }),
        );
      }
    });
  };

  //*İlanları getirme
  useEffect(() => {
    const getListings = async () => {
      if (!user?.id) return;
      const { data } = await supabase
        .from("listings")
        .select()
        .eq("seller_id", user?.id);
      setListings(data ?? []);
    };

    getListings();
  }, [user?.id]);

  //*İlan ekleme
  const handleAddListing = () => {
    console.log("sıhwsdıu");
  };

  //*ilan expire date i alma
  const getRemainingTime = (createdAt: string) => {
    const end = new Date(createdAt).getTime() + 30 * 24 * 60 * 60 * 1000;
    const diff = end - Date.now();

    if (diff <= 0) return "Süre doldu";

    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);

    return `${d}g ${h}s ${m}dk`;
  };
  // *ilan resimleri
  const getImages = (image_paths?: any) => {
    if (!image_paths) return [];
    if (Array.isArray(image_paths)) return image_paths;
    return Object.values(image_paths).filter(Boolean);
  };

  //*kullanıcı adı değişme
  const changeUserName = async () => {
    try {
      const { data } = await api.post("/users/me/changeUserName", {
        newUserName: userName,
      });

      dispatch(
        setMessage({
          message: data.message,
          messageColor: "#2bd92b",
        }),
      );
      setUserName("");
      setUserPlaceHolderName(userName);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error || "Bir hata oluştu";

      dispatch(
        setMessage({
          message: errorMessage,
          messageColor: "#f23f3f",
        }),
      );
    }
  };

  //*İsim Ekleme
  const handleSetName = async () => {
    try {
      if (name.trim().length < 3) {
        return dispatch(
          setMessage({
            message: "İsim en az 3 harf içermelidir",
            messageColor: "#f23f3f",
          }),
        );
      } else {
        const { data } = await api.post("/users/me/set", { name: name.trim() });
        if (data.error)
          return dispatch(
            setMessage({
              message: data.error,
              messageColor: "#f23f3f",
            }),
          );
        return dispatch(
          setMessage({
            message: data.message,
            messageColor: "#2bd92b",
          }),
        );
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error || "Bir hata oluştu";

      dispatch(
        setMessage({
          message: errorMessage,
          messageColor: "#f23f3f",
        }),
      );
    }
  };

  //*soyisim ekleme
  const handleSetSurname = async () => {
    try {
      if (surname.trim().length < 2) {
        return dispatch(
          setMessage({
            message: "Soyisim en az 2 harf içermelidir",
            messageColor: "#f23f3f",
          }),
        );
      } else {
        const { data } = await api.post("/users/me/set", {
          surname: surname.trim(),
        });
        if (data.error)
          return dispatch(
            setMessage({
              message: data.error,
              messageColor: "#f23f3f",
            }),
          );
        return dispatch(
          setMessage({
            message: data.message,
            messageColor: "#2bd92b",
          }),
        );
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error || "Bir hata oluştu";

      dispatch(
        setMessage({
          message: errorMessage,
          messageColor: "#f23f3f",
        }),
      );
    }
  };

  //*telefon ekleme
  const handleSetPhone = async () => {
    try {
      if (!phone.startsWith("5") || phone.length !== 10) {
        return dispatch(
          setMessage({
            message: "Geçerli bir telefon numarası giriniz",
            messageColor: "#f23f3f",
          }),
        );
      }

      const { error } = await supabase.auth.updateUser({
        phone: `+90${phone}`,
      });

      if (error) {
        return dispatch(
          setMessage({
            message: error.message,
            messageColor: "#f23f3f",
          }),
        );
      }
    } catch (error) {
      dispatch(
        setMessage({
          message: "Telefon eklenirken bir hata oluştu",
          messageColor: "#f23f3f",
        }),
      );
    }

    dispatch(
      setMessage({
        message: "Doğrulama kodu SMS ile gönderildi",
        messageColor: "#2bd92b",
      }),
    );
  };

  //*telefon doğrulama
  const handleVerifyPhone = async () => {
    if (otp.length !== 6) return;

    const { error } = await supabase.auth.verifyOtp({
      phone: `+90${phone}`,
      token: otp,
      type: "sms",
    });

    if (error) {
      return dispatch(
        setMessage({
          message: "Kod yanlış veya süresi dolmuş",
          messageColor: "#f23f3f",
        }),
      );
    }

    dispatch(
      setMessage({
        message: "Telefon numarası doğrulandı",
        messageColor: "#2bd92b",
      }),
    );

    setPhoneModal(false);
    setOtp("");
    setTimeLeft(60);
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
          }),
        );
        formik.resetForm();
        setShowPasswordModal(false);
      } catch (err: any) {
        if (
          err.message.includes(
            "New password should be different from the old password.",
          )
        ) {
          dispatch(
            setMessage({
              message: "Hata: Lütfen Şu ankinden Farklı Bir Şifre Giriniz",
              messageColor: "#f23f3f",
            }),
          );
        } else {
          dispatch(
            setMessage({
              message:
                "Bilinmeyen bir Hata Oluştu Lütfen Daha Sonra Tekrar Deneyiniz",
              messageColor: "#f23f3f",
            }),
          );
        }
      } finally {
        setLoading(false);
      }
    },
  });

  const { values, errors, touched, handleChange, handleSubmit } = formik;

  if (!user) return <NotFound />;
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-200 via-sky-200 to-pink-200 flex justify-center items-start p-4 sm:p-6">
      <div
        onClick={() => navigate(-1)}
        className="md:hidden fixed z-1000 flex left-2 items-center justify-center w-11 h-11 rounded-full bg-white/80 backdrop-blur-md shadow-lg cursor-pointer hover:scale-110 hover:shadow-xl active:scale-95 transition-all duration-300"
      >
        <TiArrowBack className="w-6 h-6 text-gray-700" />
      </div>
      <div className="relative w-full max-w-6xl bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_30px_80px_rgba(0,0,0,0.18)] p-6 sm:p-10 space-y-10">
        {/*profil*/}
        <div className="flex flex-col md:flex-row items-start gap-6 md:gap-8">
          {/* Avatar */}
          <div className="relative group flex-shrink-0 mx-auto md:mx-0">
            {preview ? (
              <img
                src={preview}
                className="w-24 h-24 sm:w-28 sm:h-28 md:w-36 md:h-36 rounded-full object-cover ring-4 ring-white shadow-xl"
              />
            ) : user.avatar_url ? (
              <img
                src={user.avatar_url}
                className="w-24 h-24 sm:w-28 sm:h-28 md:w-36 md:h-36 rounded-full object-cover ring-4 ring-white shadow-xl"
              />
            ) : (
              <FaUserCircle className="w-24 h-24 sm:w-28 sm:h-28 md:w-36 md:h-36 text-gray-400 ring-4 ring-white shadow-xl rounded-full" />
            )}

            {user.avatar_url ? (
              <button
                onClick={handleAvatarDelete}
                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1.5 shadow-lg hover:bg-red-600 transition"
              >
                <IoIosRemoveCircle className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            ) : (
              <label className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-3 py-1.5 rounded-full text-xs shadow-lg cursor-pointer hover:bg-blue-600 transition">
                <PiUploadSimpleBold />
                <input
                  type="file"
                  accept="image/webp,image/jpeg,image/png"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 bg-white rounded-3xl p-4 sm:p-6 md:p-8 shadow-lg border border-gray-100 w-full">
            {/* USERNAME */}
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-6">
              Merhaba,
              <span className="flex items-center gap-3 mt-2">
                <input
                  className="flex-1 bg-transparent outline-none text-gray-700 font-bold text-xl sm:text-2xl md:text-3xl placeholder-gray-400"
                  placeholder={userPlaceHolderName}
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                />

                {userName && userName.length >= 3 && (
                  <button
                    onClick={changeUserName}
                    className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:text-gray-900 hover:bg-gray-200"
                  >
                    <CgCheck size={16} />
                  </button>
                )}
              </span>
            </h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* NAME */}
              <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                <div className="flex-1">
                  <p className="text-xs text-gray-400 uppercase">İsim</p>
                  {user.real_name ? (
                    <p className="text-gray-800 font-medium">
                      {user.real_name}
                    </p>
                  ) : (
                    <input
                      onChange={(e) => setName(e.target.value)}
                      value={name}
                      className="w-full bg-transparent outline-none text-gray-800 font-medium"
                    />
                  )}
                </div>

                {!user.real_name && (
                  <button
                    onClick={handleSetName}
                    className="ml-3 w-8 h-8 flex items-center justify-center rounded-full bg-white shadow text-gray-500 hover:text-gray-900"
                  >
                    <CgInsertAfterO size={16} />
                  </button>
                )}
              </div>

              {/* SURNAME */}
              <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                <div className="flex-1">
                  <p className="text-xs text-gray-400 uppercase">Soyisim</p>
                  {user.real_surname ? (
                    <p className="text-gray-800 font-medium">
                      {user.real_surname}
                    </p>
                  ) : (
                    <input
                      onChange={(e) => setSurname(e.target.value)}
                      value={surname}
                      className="w-full bg-transparent outline-none text-gray-800 font-medium"
                    />
                  )}
                </div>

                {!user.real_surname && (
                  <button
                    onClick={handleSetSurname}
                    className="ml-3 w-8 h-8 flex items-center justify-center rounded-full bg-white shadow text-gray-500 hover:text-gray-900"
                  >
                    <CgInsertAfterO size={16} />
                  </button>
                )}
              </div>

              {/* EMAIL */}
              <div className="bg-gray-50 rounded-xl px-4 py-3 sm:col-span-2">
                <p className="text-xs text-gray-400 uppercase">Email</p>
                <p className="text-gray-800 font-medium break-all">
                  {user.email}
                </p>
              </div>

              {/* PHONE */}
              <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 sm:col-span-2">
                <div className="flex-1">
                  <p className="text-xs text-gray-400 uppercase">Telefon</p>

                  {user.phone ? (
                    <div className="flex items-center gap-2">
                      <p className="text-gray-800 font-medium">{user.phone}</p>

                      {user.phone_confirmed_at ? (
                        <CgCheck className="text-green-500" size={18} />
                      ) : (
                        <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded-full">
                          Doğrulanmadı
                        </span>
                      )}
                    </div>
                  ) : (
                    <input
                      onChange={(e) => setPhone(e.target.value)}
                      value={phone}
                      className="w-full bg-transparent outline-none text-gray-800 font-medium"
                    />
                  )}
                </div>

                {/* BUTTON */}
                {user.phone && !user.phone_confirmed_at && (
                  <button
                    onClick={() => {
                      setPhoneModal(true);
                      setTimeLeft(60);
                    }}
                    className="ml-3 flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs shadow text-gray-600 hover:text-gray-900"
                  >
                    <MdVerified size={14} />
                    Onayla
                  </button>
                )}

                {!user.phone && (
                  <button
                    onClick={handleSetPhone}
                    className="ml-3 w-8 h-8 flex items-center justify-center rounded-full bg-white shadow text-gray-500 hover:text-gray-900"
                  >
                    <CgInsertAfterO size={16} />
                  </button>
                )}
              </div>

              {openPhoneModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                  <div className="w-80 rounded-xl bg-white p-5 shadow-lg">
                    <h3 className="mb-3 text-sm font-medium text-gray-700">
                      6 haneli doğrulama kodunu giriniz
                    </h3>

                    <input
                      value={otp}
                      onChange={(e) => {
                        if (/^\d*$/.test(e.target.value))
                          setOtp(e.target.value.slice(0, 6));
                      }}
                      placeholder="______"
                      className="mb-3 w-full rounded border px-3 py-2 text-center tracking-widest outline-none"
                    />

                    <button
                      onClick={handleVerifyPhone}
                      disabled={otp.length !== 6}
                      className="w-full rounded bg-black py-2 text-sm text-white disabled:opacity-40"
                    >
                      Onayla
                    </button>

                    <p className="mt-3 text-center text-xs text-gray-500">
                      {timeLeft} sn sonra kapanacak
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/*butonlar*/}
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
            onClick={handleAddListing}
            className="relative flex items-center justify-between bg-red-500 text-white py-4 rounded-2xl shadow-lg hover:scale-[1.03] hover:bg-red-600 transition"
          >
            <div className="flex items-center gap-2 ml-5">
              <MdNoAccounts className="w-6 h-6" />
              <span className="font-semibold">İlan Ekle</span>
            </div>
            <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-amber-300 text-xs font-bold shadow">
              {user.listing_quota}
            </span>
          </button>

          {user.role == "admin" && (
            <button
              onClick={() => navigate("/panel")}
              className="flex items-center gap-3 bg-indigo-600 text-white py-4 rounded-2xl shadow-lg hover:scale-[1.03] hover:bg-indigo-700 transition"
            >
              <RiAdminFill className="w-6 h-6 ml-5" />
              <span className="font-semibold">Admin Paneli</span>
            </button>
          )}
        </div>

        <div className="flex flex-col py-5 bg-gray-100 rounded-2xl -m-4">
          <h1 className="text-xl font-semibold text-gray-800 mb-4">
            Yayındaki İlanlarınız
          </h1>

          {!listings || listings.length === 0 ? (
            <div className="flex items-center justify-center py-16 bg-white rounded-2xl shadow-sm">
              <p className="text-gray-500 text-sm">
                Henüz yayında olan bir ilanınız bulunmuyor.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-6">
              {listings.map((listing) => {
                const images = getImages(listing.image_paths);
                const cover = images[0];

                return (
                  <div
                    key={listing.id}
                    onClick={() => navigate(`/ilan/${listing.id}`)}
                    className="group bg-white rounded-3xl shadow-md hover:shadow-xl transition cursor-pointer overflow-hidden flex flex-col"
                  >
                    <div className="relative w-full h-40 bg-gray-100 overflow-hidden">
                      {cover ? (
                        <img
                          src={cover}
                          alt={listing.listing_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                          Resim yok
                        </div>
                      )}

                      <div className="absolute bottom-2 right-2 bg-yellow-500 text-white text-sm font-bold px-3 py-1 rounded-full shadow whitespace-nowrap">
                        {listing.listing_price} ₺
                      </div>

                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="absolute top-2 right-2 bg-white/80 backdrop-blur rounded-full p-2 text-gray-600 hover:text-gray-900"
                      >
                        <MdEdit size={16} />
                      </button>
                    </div>

                    <div className="p-4 flex flex-col gap-2 flex-1">
                      <h3 className="font-semibold text-gray-800 text-sm truncate">
                        {listing.listing_name}
                      </h3>

                      <p className="text-xs text-gray-500 line-clamp-2">
                        {listing.listing_description}
                      </p>

                      <div className="mt-auto flex justify-end">
                        <span className="text-[11px]  text-gray-400  whitespace-nowrap  overflow-hidden  text-ellipsis  max-w-[90px] text-right">
                          {getRemainingTime(listing.created_at)}{" "}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
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
