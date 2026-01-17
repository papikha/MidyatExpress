import * as Yup from "yup";

export const regSchema = Yup.object({
  userName: Yup.string()
    .min(3, "Kullanıcı adı en az 3 karakter olmalı")
    .required("Kullanıcı adı zorunludur"),
  email: Yup.string()
    .email("Geçerli bir email adresi giriniz")
    .required("Email zorunludur"),
  password: Yup.string()
    .min(6, "Şifre en az 6 karakter olmalı")
    .required("Şifre zorunludur"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Şifreler eşleşmiyor")
    .required("Şifre tekrarı zorunludur"),
});
