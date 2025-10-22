import React, { useState } from "react";
import { useFormik } from "formik";
import { panelSchema } from "../schemas/Panelschema";
import { supabase } from "../../supabaseClient";

export default function AdminPanel() {
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  //Supabase yükleme
  async function uploadImage(file: File) {
    const fileName = `${Date.now()}_${file.name}`;
    const { error } = await supabase.storage
      .from("product_images")
      .upload(fileName, file);

    if (error) throw error;

    const { data } = supabase.storage
      .from("product_images")
      .getPublicUrl(fileName);

    return data.publicUrl;
  }

  // Ürün DB kaydetme
  async function saveProduct(values: any, imgUrl: string) {
    const { error } = await supabase.from("products").insert([
      {
        name: values.name,
        price: values.price,
        salePrice: values.salePrice || null,
        description: values.description,
        stock: values.stock,
        img_url: imgUrl,
      },
    ]);

    if (error) throw error;
  }

  const formik = useFormik({
    initialValues: {
      name: "",
      price: "",
      salePrice: "",
      description: "",
      stock: "",
    },
    validationSchema: panelSchema,
    onSubmit: async (values, { resetForm }) => {
      if (!file) {
        alert("Lütfen ürün görseli yükleyin!");
        return;
      }

      try {
        setLoading(true);
        const imgUrl = await uploadImage(file);
        await saveProduct(values, imgUrl);
        alert("Ürün başarıyla kaydedildi!");
        resetForm();
        setFile(null);
        setPreview(null);
      } catch (err: any) {
        console.error(err);
        alert("Hata: " + err.message);
      } finally {
        setLoading(false);
      }
    },
  });

  //Görsel seçimi
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    const validTypes = ["image/png", "image/jpeg", "image/webp"];
    if (!validTypes.includes(selected.type)) {
      alert("Sadece PNG, JPEG veya WEBP dosyaları kabul edilir.");
      return;
    }
    if (selected.size > 5 * 1024 * 1024) {
      alert("Dosya boyutu 5MB'ı aşmamalıdır.");
      return;
    }

    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

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
                name="salePrice"
                value={formik.values.salePrice}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="mt-2 w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="80.00"
              />
              {formik.touched.salePrice && formik.errors.salePrice && (
                <p className="text-red-600 text-sm mt-1">
                  {formik.errors.salePrice}
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

          {/* Görsel Yükleme */}
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
      </div>
    </div>
  );
}
