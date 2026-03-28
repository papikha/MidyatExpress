import * as yup from "yup";

export const listingYup = yup.object().shape({
  title: yup
    .string()
    .required("İlan ismi gerekli")
    .min(10, "En az 10 karakter olmalı")
    .max(50, "En fazla 50 karakter olmalı"),

  description: yup
    .string()
    .required("İlan detayları gerekli")
    .min(100, "En az 100 karakter olmalı")
    .max(500, "En fazla 500 karakter olmalı"),

  images: yup.array().max(5, "En fazla 5 resim ekleyebilirsiniz"),
});
