import * as yup from "yup";

export const loginSchema = yup.object().shape({
    email : yup.string().email("Geçerli Email Adresi Giriniz").required("Email Adresi Zorunlu"),
    password: yup.string().required("Lütfen Şifre Giriniz"),
})