import * as Yup from "yup";

export const panelSchema = Yup.object({
    name: Yup.string().required("Ürün ismi zorunludur."),
    price: Yup.number()
      .typeError("Geçerli bir fiyat giriniz.")
      .positive("Fiyat 0'dan büyük olmalıdır.")
      .required("Fiyat zorunludur."),
    salePrice: Yup.number()
      .typeError("Geçerli bir indirimli fiyat giriniz.")
      .positive("İndirimli fiyat 0'dan büyük olmalıdır.")
      .notRequired(),
    description: Yup.string()
      .required("Ürün açıklaması zorunludur.")
      .min(10, "Açıklama en az 10 karakter olmalı."),
    stock: Yup.number()
      .typeError("Geçerli bir stok miktarı giriniz.")
      .integer("Stok tam sayı olmalıdır.")
      .min(0, "Stok negatif olamaz.")
      .required("Stok zorunludur."),
  });