import { useEffect, useState } from "react";
import { useFormik } from "formik";
import { panelSchema } from "../schemas/Panelschema";
import api from "../api/axios";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../redux/store";
import { getUser } from "../redux/slices/UserSlice";
import NotFound from "../Components/NotFound";
import Loading from "../Components/Loading";
import { setMessage } from "../redux/slices/MessageSlice";
import MessageBox from "../Components/MessageBox";
import MessageButton from "../Components/MessageButton";
import { TiArrowBack } from "react-icons/ti";
import { useNavigate } from "react-router-dom";

function AdminPanel() {
  const navigate = useNavigate();
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const { user, loading: isLoading } = useSelector(
    (state: RootState) => state.user
  );
  const { message } = useSelector((state: RootState) => state.message);
  const dispatch = useDispatch<AppDispatch>();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    const allowed = ["image/png", "image/jpeg", "image/webp"];
    if (!allowed.includes(selected.type))
      return dispatch(
        setMessage({
          message: "Sadece PNG, JPEG, WEBP kabul edilir.",
          messageColor: "#f23f3f",
        })
      );
    if (selected.size > 5 * 1024 * 1024)
      return dispatch(
        setMessage({
          message: "5 mb üstü yüklenemez.",
          messageColor: "#f23f3f",
        })
      );

    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  const formik = useFormik({
    initialValues: {
      name: "",
      price: "",
      new_price: "",
      description: "",
      stock: "",
    },
    validationSchema: panelSchema,
    onSubmit: async (values, { resetForm }) => {
      if (!file)
        return dispatch(
          setMessage({
            message: "Lütfen ürün görseli yükleyin.",
            messageColor: "#f23f3f",
          })
        );
      try {
        setLoading(true);

        const formData = new FormData();
        formData.append("file", file);
        formData.append("name", values.name);
        formData.append("price", values.price);
        formData.append("new_price", values.new_price || "");
        formData.append("stock", values.stock);
        formData.append("description", values.description);

        const res = await api.post("/panel", formData);

        dispatch(
          setMessage({ message: res.data.message, messageColor: "#f2d73f" })
        );
        resetForm();
        setFile(null);
        setPreview(null);
      } catch (err: any) {
        if (
          err.message.includes("Products_name_key") ||
          err.response.data.error.includes("Products_name_key")
        )
          dispatch(
            setMessage({
              message: `Hata: Zaten Bu isimde Başka Bir Ürün Var`,
              messageColor: "#f23f3f",
            })
          );
        else
          dispatch(
            setMessage({
              message: `Hata:  ${err.response?.data?.error || err.message}`,
              messageColor: "#f23f3f",
            })
          );
      } finally {
        setLoading(false);
      }
    },
  });

  useEffect(() => {
    dispatch(getUser());
  }, [dispatch]);

  if (isLoading) return <Loading />;
  if (!user) return <NotFound />;
  if (user.role != "admin") return <NotFound />;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-100 p-6">
      <div className="w-full max-w-3xl bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
        <h1 className="text-3xl font-semibold text-gray-800 mb-8 text-center">
          Admin Panel – Ürün Ekle
        </h1>

        <form onSubmit={formik.handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Ürün İsmi
              </label>
              <input
                type="text"
                name="name"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="mt-2 w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Örn: Yazlık Gömlek"
              />
              {formik.touched.name && formik.errors.name && (
                <p className="text-red-600 text-sm mt-1">
                  {formik.errors.name}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Stok
              </label>
              <input
                type="number"
                name="stock"
                value={formik.values.stock}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="mt-2 w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="0"
              />
              {formik.touched.stock && formik.errors.stock && (
                <p className="text-red-600 text-sm mt-1">
                  {formik.errors.stock}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Fiyat (₺)
              </label>
              <input
                type="number"
                name="price"
                value={formik.values.price}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="mt-2 w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="100.00"
              />
              {formik.touched.price && formik.errors.price && (
                <p className="text-red-600 text-sm mt-1">
                  {formik.errors.price}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                İndirimli Fiyat (₺)
              </label>
              <input
                type="number"
                name="new_price"
                value={formik.values.new_price}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="mt-2 w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="80.00"
              />
              {formik.touched.new_price && formik.errors.new_price && (
                <p className="text-red-600 text-sm mt-1">
                  {formik.errors.new_price}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Ürün Açıklaması
            </label>
            <textarea
              name="description"
              value={formik.values.description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              rows={4}
              placeholder="Ürün hakkında detaylı bilgi..."
              className="mt-2 w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none"
            ></textarea>
            {formik.touched.description && formik.errors.description && (
              <p className="text-red-600 text-sm mt-1">
                {formik.errors.description}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Ürün Görseli
            </label>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleFileChange}
              className="mt-2 text-sm text-gray-700"
            />
            {preview && (
              <div className="mt-4 w-40 h-40 rounded-xl overflow-hidden border-2 border-gray-200 shadow">
                <img
                  src={preview}
                  alt="Ürün önizleme"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 text-white font-semibold rounded-xl shadow transition ${
              loading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Yükleniyor..." : "Ürünü Kaydet"}
          </button>
        </form>
        {message && <MessageBox />}
      </div>
      <MessageButton where="bottom" />
      <div
        onClick={() => navigate("/")}
        className="md:hidden fixed z-1000 flex right-5 bottom-5 items-center justify-center w-11 h-11 rounded-full bg-white/80 backdrop-blur-md shadow-lg cursor-pointer hover:scale-110 hover:shadow-xl active:scale-95 transition-all duration-300"
      >
        <TiArrowBack className="w-6 h-6 text-gray-700" />
      </div>
    </div>
  );
}

export default AdminPanel;
