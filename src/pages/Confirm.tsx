import { FaEnvelopeOpenText, FaCheckCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function Confirm() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-300 via-indigo-200 to-purple-300">
      <div className="bg-white/80 backdrop-blur-md p-10 rounded-2xl shadow-lg text-center max-w-md w-full">
        <div className="flex justify-center text-indigo-600 mb-4">
          <FaEnvelopeOpenText size={64} />
        </div>
        <h1 className="text-2xl font-semibold text-indigo-700 mb-2">
          Email Onayı Bekleniyor
        </h1>
        <p className="text-gray-700 mb-4">
          📩 Kayıt işlemin başarılı oldu! Şimdi email adresine bir doğrulama bağlantısı gönderdik.
        </p>
        <p className="text-sm text-gray-600 mb-6">
          Lütfen mail kutunu (ve spam klasörünü) kontrol et.  
          Emailini onayladıktan sonra giriş yapabilirsin.
        </p>

        <button
          onClick={() => navigate("/Giriş")}
          className="bg-indigo-500 text-white px-6 py-2 rounded-md hover:bg-indigo-600 transition-all font-medium"
        >
          Giriş Yapmaya Git
        </button>

        <div className="mt-6 text-green-600 flex items-center justify-center gap-2 text-sm">
          <FaCheckCircle />
          Emailini onayladıysan hesabına giriş yapabilirsin!
        </div>
      </div>
    </div>
  );
}

export default Confirm;
