import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import { tradesmanYup } from "../schemas/TradesmanSchema";
import api from "../api/axios";
import { setMessage } from "../redux/slices/MessageSlice";
import { useDispatch, useSelector } from "react-redux";
import { TiArrowBack } from "react-icons/ti";
import { useNavigate } from "react-router-dom";
import MessageBox from "./MessageBox";
import type { RootState } from "../redux/store";

interface Job_for_prices {
  job: string;
  price: number;
}

const BecomeTradesman: React.FC = () => {
  const [images, setImages] = useState<(File | null)[]>([null]);
  const { message } = useSelector((state: RootState) => state.message);
  const [jobForPrices, setJobForPrices] = useState<
    Record<string, Job_for_prices>
  >({});
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

  const deleteEmptyJobForPrices = () => {
    const finalJobForPrices = Object.fromEntries(
      Object.entries(jobForPrices).filter(
        ([, value]) => value.job.trim() !== "",
      ),
    );

    return finalJobForPrices;
  };

  const submit = async () => {
    const fixedImages: File[] = images
      .filter((img): img is File => img !== null)
      .map((img) => {
        const fixedName = fixFileName(img.name);

        return new File([img], fixedName, { type: img.type });
      });
    const finalJobForPrices = deleteEmptyJobForPrices();

    const formData = new FormData();
    fixedImages.map((image) => formData.append(`images`, image));
    formData.append("job_title", values.job_title);
    formData.append("information", values.information);
    formData.append("address", values.address);
    formData.append("job_category", values.job_category);
    formData.append(
      "jsonStringfyJobForPrices",
      JSON.stringify(finalJobForPrices),
    );

    try {
      const { data } = await api.post(
        "/tradesman/becomingTradingsman",
        formData,
      );

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
      job_title: "",
      information: "",
      job_phone: "",
      address: "",
      job_category: "",
    },
    validationSchema: tradesmanYup,
    onSubmit: submit,
  });
  const { values, errors, touched, handleChange, handleSubmit } =
    formik;

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

        {/* yaptığı iş */}
        <div className="space-y-2">
          <label className="text-sm text-gray-600 font-medium">İşini Yaz</label>
          <input
            type="text"
            name="job_title"
            onChange={handleChange}
            value={values.job_title}
            className="w-full h-12 rounded-xl border border-gray-300 px-4 text-sm outline-none"
            placeholder="En az 10 en fazla 100 karakter"
          />
          {errors.job_title && touched.job_title && (
            <div className="ml-1 text-red-600 text-sm">{errors.job_title}</div>
          )}
        </div>

        {/* esnaf bilgisi */}
        <div className="space-y-2">
          <label className="text-sm text-gray-600 font-medium">
            Kendini anlat
          </label>
          <textarea
            name="information"
            onChange={handleChange}
            value={values.information}
            rows={6}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm resize-none outline-none"
            placeholder="En az 100 en fazla 1000 karakter"
          />
          {errors.information && touched.information && (
            <div className="ml-1 text-red-600 text-sm">
              {errors.information}
            </div>
          )}
        </div>

        <div className="flex flex-row justify-between gap-5">
          {/* iletişim no */}
          <div className="space-y-2 flex flex-col">
            <label className="text-sm text-gray-600 font-medium">
              İletişim No
            </label>
            <input
              name="job_phone"
              type="text"
              onChange={handleChange}
              value={values.job_phone}
              className="w-30 h-12 rounded-xl border border-gray-300 px-4 py-3 text-sm resize-none outline-none"
              placeholder="10 hane"
            />
            {errors.job_phone && touched.job_phone && (
              <div className="ml-1 text-red-600 text-sm">
                {errors.job_phone}
              </div>
            )}
          </div>

          {/* iş */}
          <div className="space-y-2 flex flex-col">
            <label className="text-sm text-gray-600 font-medium">İşiniz</label>
            <select
              name="job_category"
              value={values.job_category}
              onChange={handleChange}
              className="w-full h-12 rounded-xl border px-4"
            >
              <option>İş Kategorisi seç</option>
              <option value="Technology_digital_professions">
                Teknoloji & Dijital Meslek
              </option>
              <option value="Technical_skilled_trades">
                Teknik & Ustalık Gerektiren Meslek
              </option>
              <option value="Construction_building_sector">
                İnşaat & Yapı Sektörü
              </option>
              <option value="Creative_design_fields">
                Yaratıcı & Tasarım Alanları
              </option>
              <option value="Consulting_office_jobs">
                Danışmanlık & Ofis İşleri
              </option>
              <option value="Service_operational_jobs">
                Hizmet & Operasyonel İşler
              </option>
              <option value="Education_personal_services">
                Eğitim & Bireysel Hizmetler
              </option>
            </select>
            {errors.job_category && touched.job_category && (
              <div className="ml-1 text-red-600 text-sm">
                {errors.job_category}
              </div>
            )}
          </div>
        </div>

        {/* İş & ve Fiyatı */}
        <div className="flex flex-col gap-4 w-full mx-auto">
          <span
            onClick={() =>
              Object.entries(jobForPrices).length < 5
                ? setJobForPrices((prev) => ({
                    ...prev,
                    [`job_for_prices${Object.entries(prev).length + 1}`]: {
                      job: "",
                      price: 0,
                    },
                  }))
                : dispatch(
                    setMessage({
                      message: "En fazla 3 İş & Fiyatı ekleyebilirsiniz",
                      messageColor: "#f23f3f",
                    }),
                  )
            }
            className="bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-700 transition w-fit self-left"
          >
            İş & Fiyatı ekle
          </span>

          <div className="flex flex-col gap-4">
            {Object.entries(jobForPrices).map(([key, value]) => (
              <div
                key={key}
                className="border rounded-xl p-4 shadow-sm bg-white flex flex-col gap-3"
              >
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-gray-500 font-medium">
                    {key[14]}. Yapacağım iş
                  </span>

                  <input
                    type="text"
                    minLength={10}
                    maxLength={250}
                    value={value.job}
                    onChange={(e) =>
                      setJobForPrices((prev) => ({
                        ...prev,
                        [key]: {
                          ...prev[key],
                          job: e.target.value,
                        },
                      }))
                    }
                    className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Soru yaz..."
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-sm text-gray-500 font-medium">
                    Beklediğin Fiyat
                  </span>

                  <input
                    type="number"
                    minLength={10}
                    maxLength={250}
                    value={value.price}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      setJobForPrices((prev) => ({
                        ...prev,
                        [key]: {
                          ...prev[key],
                          price: value,
                        },
                      }));
                    }}
                    className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Fiyat"
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
          Bize Katıl
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

export default BecomeTradesman;
