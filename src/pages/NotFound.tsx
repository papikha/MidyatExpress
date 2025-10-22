// src/pages/NotFound.tsx
import { Link } from 'react-router-dom';

function NotFound(){
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 text-white px-4">
      <h1 className="text-9xl font-extrabold drop-shadow-lg">404</h1>
      <p className="mt-4 text-2xl sm:text-3xl font-semibold">Oops! Sayfa bulunamadı.</p>
      <p className="mt-2 text-center text-lg max-w-md">
        Aradığınız sayfa mevcut değil veya kaldırılmış olabilir.
      </p>
      <Link
        to="/"
        className="mt-6 px-6 py-3 bg-white text-indigo-600 font-semibold rounded-lg shadow-lg hover:bg-gray-100 transition"
      >
        Ana Sayfaya Dön
      </Link>
    </div>
  );
};

export default NotFound;
