import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import { listingYup } from "../schemas/ListingSchema";
import api from "../api/axios";
import { setMessage } from "../redux/slices/MessageSlice";
import { useDispatch, useSelector } from "react-redux";
import { TiArrowBack } from "react-icons/ti";
import { useNavigate } from "react-router-dom";
import MessageBox from "./MessageBox";
import type { RootState } from "../redux/store";

interface Q_as {
  q: string;
  a: string;
}

const ListingCreate: React.FC = () => {
  const [images, setImages] = useState<(File | null)[]>([null]);
  const { message } = useSelector((state: RootState) => state.message);
  const [q_as, setQ_as] = useState<Record<string, Q_as>>({});
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const fixFileName = (fileName: string) => {
    const map: any = {
      ç: "c",
      Ç: "C",
      ğ: "g",
      Ğ: "G",
      ı: "i",
      İ: "I",
      ö: "o",
      Ö: "O",
      ş: "s",
      Ş: "S",
      ü: "u",
      Ü: "U",
    };

    return fileName.replaceAll(/[çÇğĞıİöÖşŞüÜ]/g, (char) => map[char]);
  };

  const deleteEmptyQ_as = () => {
    const finalQ_as = Object.fromEntries(
      Object.entries(q_as).filter(
        ([, value]) => value.q.trim() !== "" && value.a.trim() !== "",
      ),
    );

    return finalQ_as;
  };

  const submit = async () => {
    const fixedImages: File[] = images
      .filter((img): img is File => img !== null)
      .map((img) => {
        const fixedName = fixFileName(img.name);

        return new File([img], fixedName, { type: img.type });
      });
      const finalQ_as = deleteEmptyQ_as();

    const formData = new FormData();
    fixedImages.map((image) => formData.append(`images`, image));
    formData.append("title", values.title);
    formData.append("description", values.description);
    formData.append("price", values.price);
    formData.append("category", values.category);
    formData.append("jsonStringfyQ_a", JSON.stringify(finalQ_as));

    try {
      const { data } = await api.post("/listings/addlisting", formData);

      if (data.error) {
        return dispatch(
          setMessage({
            message: data.error,
            messageColor: "#f23f3f",
          }),
        );
      }

      dispatch(
        setMessage({
          message: "İlanınız başarıyla eklendi",
          messageColor: "#2bd92b",
        }),
      );

      return navigate("/Profilim");
    } catch (error: any) {
      const message = error.response.data.error;
      return dispatch(
        setMessage({
          message,
          messageColor: "#f23f3f",
        }),
      );
    }
  };

  const formik = useFormik({
    initialValues: {
      title: "",
      description: "",
      price: "",
      category: "",
    },
    validationSchema: listingYup,
    onSubmit: submit,
  });
  const { values, errors, touched, handleChange, handleSubmit, setFieldValue } =
    formik;

  useEffect(() => {
    const price = Number(values.price);

    if ((isNaN(price) || price < 0) && values.price !== "0") {
      setFieldValue("price", "0");
    }
  }, [values.price, setFieldValue]);

  const handleImageAdd = (file: File, index: number) => {
    const newImages = [...images];
    newImages[index] = file;

    if (newImages.length < 5 && index === images.length - 1) {
      newImages.push(null);
    }

    setImages(newImages);
  };

  return (
    <div className="min-h-screen bg-[#f9fafb] flex justify-center py-12 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-3xl bg-white rounded-2xl shadow-md p-6 sm:p-8 space-y-8"
      >
        {/* resim yükleme yeri */}
        <div className="flex space-x-3 overflow-x-auto pb-2">
          {images.map((img, index) => (
            <label
              key={index}
              className="relative flex-shrink-0 w-32 h-32 rounded-xl border-2 border-dashed cursor-pointer
              hover:border-blue-400 bg-[#fcfcfc] flex items-center justify-center"
            >
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) =>
                  e.target.files && handleImageAdd(e.target.files[0], index)
                }
              />
              {img ? (
                <img
                  src={URL.createObjectURL(img)}
                  alt="preview"
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <span className="text-gray-400 text-center text-sm px-2">
                  Resim ekle
                </span>
              )}
            </label>
          ))}
        </div>

        {/* başlık */}
        <div className="space-y-2">
          <label className="text-sm text-gray-600 font-medium">İlan İsmi</label>
          <input
            type="text"
            name="title"
            onChange={handleChange}
            value={values.title}
            className="w-full h-12 rounded-xl border border-gray-300 px-4 text-sm outline-none"
            placeholder="En az 10 en fazla 40 karakter"
          />
          {errors.title && touched.title && (
            <div className="ml-1 text-red-600 text-sm">{errors.title}</div>
          )}
        </div>

        {/* açıklama */}
        <div className="space-y-2">
          <label className="text-sm text-gray-600 font-medium">
            İlan Detayları
          </label>
          <textarea
            name="description"
            onChange={handleChange}
            value={values.description}
            rows={6}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm resize-none outline-none"
            placeholder="En az 100 en fazla 500 karakter"
          />
          {errors.description && touched.description && (
            <div className="ml-1 text-red-600 text-sm">
              {errors.description}
            </div>
          )}
        </div>

        <div className="flex flex-row justify-between gap-5">
          {/* fiyat */}
          <div className="space-y-2 flex flex-col">
            <label className="text-sm text-gray-600 font-medium">
              İlan Fiyatı
            </label>
            <input
              name="price"
              type="number"
              onChange={handleChange}
              value={values.price}
              className="w-30 h-12 rounded-xl border border-gray-300 px-4 py-3 text-sm resize-none outline-none"
              placeholder="Fiyat"
            />
            {errors.price && touched.price && (
              <div className="ml-1 text-red-600 text-sm">{errors.price}</div>
            )}
          </div>

          {/* kategori */}
          <div className="space-y-2 flex flex-col">
            <label className="text-sm text-gray-600 font-medium">
              Kategori
            </label>
            <select
              name="category"
              value={values.category}
              onChange={handleChange}
              className="w-full h-12 rounded-xl border px-4"
            >
              <option value="second_hand">İkinci El</option>
              <option value="vehicles">Vasıta</option>
              <option value="spare_parts">Yedek Parça</option>
              <option value="real_estate">Emlak</option>
              <option value="industry">Sanayi</option>
              <option value="job_listings">İş İlanları</option>
              <option value="animals">Hayvanlar</option>
              <option value="hobbies_entertainment">Hobi & Eğlence</option>
              <option value="fashion">Moda</option>
              <option value="home_living">Ev & Yaşam</option>
            </select>
            {errors.category && touched.category && (
              <div className="ml-1 text-red-600 text-sm">{errors.category}</div>
            )}
          </div>
        </div>

        {/* soru cevap */}
        <div className="flex flex-col gap-4 w-full mx-auto">
          <span
            onClick={() =>
              Object.entries(q_as).length < 3
                ? setQ_as((prev) => ({
                    ...prev,
                    [`q-a${Object.entries(prev).length + 1}`]: { q: "", a: "" },
                  }))
                : dispatch(
                    setMessage({
                      message: "En fazla 3 soru-cevap ekleyebilirsiniz",
                      messageColor: "#f23f3f",
                    }),
                  )
            }
            className="bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-700 transition w-fit self-left"
          >
            soru-cevap ekle
          </span>

          <div className="flex flex-col gap-4">
            {Object.entries(q_as).map(([key, value]) => (
              <div
                key={key}
                className="border rounded-xl p-4 shadow-sm bg-white flex flex-col gap-3"
              >
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-gray-500 font-medium">
                    {key[3]}. soru
                  </span>

                  <input
                    type="text"
                    minLength={10}
                    maxLength={250}
                    value={value.q}
                    onChange={(e) =>
                      setQ_as((prev) => ({
                        ...prev,
                        [key]: {
                          ...prev[key],
                          q: e.target.value,
                        },
                      }))
                    }
                    className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Soru yaz..."
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-sm text-gray-500 font-medium">
                    cevap
                  </span>

                  <input
                    type="text"
                    minLength={10}
                    maxLength={250}
                    value={value.a}
                    onChange={(e) =>
                      setQ_as((prev) => ({
                        ...prev,
                        [key]: {
                          ...prev[key],
                          a: e.target.value,
                        },
                      }))
                    }
                    className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Cevap yaz..."
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* submit */}
        <button
          type="submit"
          className="w-full h-12 rounded-xl bg-blue-500 text-white text-sm font-semibold
          hover:bg-blue-600 transition-colors"
        >
          Ekle
        </button>
      </form>
      {message && <MessageBox />}
      <div
        onClick={() => navigate(-1)}
        className="md:hidden fixed z-1000 flex right-2 items-center justify-center w-11 h-11 rounded-full bg-white/80 backdrop-blur-md shadow-lg cursor-pointer hover:scale-110 hover:shadow-xl active:scale-95 transition-all duration-300"
      >
        <TiArrowBack className="w-6 h-6 text-gray-700" />
      </div>
    </div>
  );
};

export default ListingCreate;
