import * as yup from "yup";

export const tradesmanYup = yup.object().shape({
  job_title: yup
    .string()
    .required("Ne yaptığınızı kısaca giriniz")
    .min(10, "En az 10 karakter olmalı")
    .max(100, "En fazla 100 karakter olmalı"),

  information: yup
    .string()
    .required("Kendiniz hakkında bilgi veriniz")
    .min(100, "En az 100 karakter olmalı")
    .max(1000, "En fazla 1000 karakter olmalı"),

  images: yup.array().max(5, "En fazla 5 resim ekleyebilirsiniz"),

  job: yup.string().required("İşiniz gerekli"),

  address: yup.string().required("İş yeri adresi gerekli"),

  job_phone: yup
  .string()
  .required("İletişim numaranız gerekli")
  .matches(/^[0-9]+$/, "Sadece sayı giriniz")
  .length(10, "10 hane giriniz")
});