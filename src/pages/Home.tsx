import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaRegUser, FaBell } from "react-icons/fa";
import { IoSearchOutline, IoWallet } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../redux/store";
import { getAllProducts } from "../redux/slices/ProductSlice";
import logo from "../images/Logo.png";
import hazirlaniyor from "../images/hazırlanıyor.jpg";
import { getUser } from "../redux/slices/UserSlice";
import MessageBox from "../Components/MessageBox";

function Home() {
  const { products } = useSelector((state: RootState) => state.products);
  const { user, loading } = useSelector((state: RootState) => state.user);
  const { message } = useSelector((state: RootState) => state.message);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [searchActive, setSearchActive] = useState(false);

  useEffect(() => {
    dispatch(getAllProducts());
    dispatch(getUser());
  }, [dispatch]);

  const handleProfileClick = () => {
    if (!loading && user?.id) navigate("/Profilim");
    else navigate("/Kayıt");
  };

  return (
    <div className="relative w-full min-h-screen bg-gradient-to-br from-indigo-100 via-white to-purple-200 overflow-x-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.3),_transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_rgba(255,255,255,0.2),_transparent_70%)] pointer-events-none" />

      {/* Navbar */}
      <nav className="flex justify-between items-center px-6 sm:px-10 py-4 bg-white/50 backdrop-blur-md shadow-md border-b border-white/30 sticky top-0 z-50 rounded-b-2xl transition-all duration-300">
        {/* Logo */}
        <div className={`flex items-center gap-3 ${!searchActive || "hidden"}`}>
          <img
            src={logo}
            alt="Logo"
            className="w-10 h-10 rounded-full border border-white/50 shadow hover:scale-110 transition duration-300"
          />
          <h1 className="text-xl sm:text-2xl font-bold text-indigo-700 hover:text-indigo-900 transition hidden sm:block">
            MidyatExpress
          </h1>
        </div>

        {/* Arama */}
        <div
          className={`flex items-center bg-white/60 rounded-full px-4 py-2 border border-white/50 shadow-inner transition-all duration-300
          ${searchActive ? "w-full" : "w-[60%] sm:w-[40%]"}`}
        >
          <IoSearchOutline className="text-indigo-700 text-xl mr-2" />
          <input
            type="text"
            placeholder="Ara"
            className={`bg-transparent outline-none text-indigo-800 w-full placeholder-indigo-400 ${
              searchActive || "w-full"
            }`}
            onFocus={() => setSearchActive(true)}
            onBlur={() => setSearchActive(false)}
          />
        </div>

        {/* İkonlar */}
        <div
          className={`flex items-center gap-2 transition-all duration-300 ${
            !searchActive || "hidden pointer-events-none"
          }`}
        >
          {!loading && user && (
            <div className="relative group">
              <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-white/50 flex items-center justify-center cursor-pointer hover:bg-yellow-100 border border-white/40 transition-all duration-300 shadow">
                <IoWallet className="w-[70%] h-[70%]" />
              </div>

              <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-300 pointer-events-none">
                <div className="bg-yellow-200 text-yellow-900 text-sm font-semibold px-3 py-1 rounded-xl shadow-md whitespace-nowrap text-center">
                  ₺{user.balance}
                </div>
                <div className="w-3 h-3 bg-yellow-200 rotate-45 absolute left-1/2 transform -translate-x-1/2 -top-1"></div>
              </div>
            </div>
          )}

          {user && (
            <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-white/50 flex items-center justify-center cursor-pointer hover:bg-indigo-200 border border-white/40 transition-all duration-300 shadow">
              <FaBell className="text-indigo-800 text-lg sm:text-xl" />
            </div>
          )}

          <div
            onClick={handleProfileClick}
            className="w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-white/50 flex items-center justify-center cursor-pointer hover:bg-indigo-200 border border-white/40 transition-all duration-300 shadow"
          >
            {" "}
            {user?.avatar_url ? (
              <img
                className="w-8 h-8 sm:w-11 sm:h-11 rounded-full"
                src={user.avatar_url}
              />
            ) : (
              <FaRegUser className="text-indigo-800 text-lg sm:text-xl" />
            )}
          </div>
        </div>
      </nav>

      {/* Main */}
      <main className="flex flex-col items-center px-4 sm:px-8 py-12 text-center z-10 relative">
        <section className="mb-14 max-w-2xl">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-indigo-800 drop-shadow-sm mb-4 animate-fade-in">
            MidyatExpress’e Hoş Geldin 🚀
          </h2>
          <p className="text-md sm:text-lg text-indigo-700/80 leading-relaxed">
            Her kategoride aradığın hizmet burada. Keşfetmeye başla!
          </p>
        </section>

        {/* Fırsatlar */}
        <section className="w-full max-w-7xl mb-16">
          <h3 className="text-3xl font-bold text-red-600 mb-6 text-left px-1">
            Fırsatlar 🔥
          </h3>
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex space-x-6 px-2 pb-2 snap-x snap-mandatory">
              {products
                .filter((product) => product.new_price)
                .map((product) => (
                  <div
                    key={product.id}
                    className="min-w-[230px] max-w-[230px] bg-gradient-to-br from-red-100 via-yellow-50 to-pink-100 rounded-3xl p-5 shadow-xl border border-red-200/50 flex flex-col items-center justify-between transition-transform hover:scale-105 hover:shadow-2xl duration-300 snap-start"
                  >
                    <img
                      src={product.img_url || hazirlaniyor}
                      alt={product.name}
                      className="w-28 h-28 object-contain mb-3 drop-shadow"
                    />
                    <h4 className="text-md font-semibold text-red-800 text-center">
                      {product.name}
                    </h4>
                    <div className="flex flex-col items-center">
                      <span className="text-gray-500 line-through text-sm">
                        {product.price}
                      </span>
                      <span className="text-red-600 font-bold text-lg">
                        {product.new_price}
                      </span>
                    </div>
                    <button
                      onClick={() => navigate(`/productDetails/${product.id}`)}
                      className="mt-3 bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600 transition shadow-md"
                    >
                      İncele
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </section>

        {/* Yöresel Ürünler */}
        <section className="w-full max-w-7xl">
          <h3 className="text-3xl font-bold text-indigo-800 mb-6 text-left px-1">
            Yöresel Ürünlerimiz
          </h3>
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex space-x-6 px-2 pb-4 snap-x snap-mandatory">
              {products
                .filter((product) => !product.new_price)
                .map((product) => (
                  <div
                    key={product.id}
                    className="min-w-[220px] max-w-[220px] bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg p-4 flex flex-col items-center justify-between transition-transform hover:scale-105 hover:shadow-2xl duration-300 snap-start"
                  >
                    <img
                      src={product.img_url || hazirlaniyor}
                      alt={product.name}
                      className="w-28 h-28 object-contain mb-3 drop-shadow"
                    />
                    <h4 className="text-md font-semibold text-indigo-800 text-center">
                      {product.name}
                    </h4>
                    <p className="text-indigo-600 font-medium mt-1 mb-2">
                      {product.price}
                    </p>
                    <button
                      onClick={() => navigate(`/productDetails/${product.id}`)}
                      className="mt-auto bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition shadow"
                    >
                      İncele
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </section>
      </main>
      {message && (
        <MessageBox/>
      )}
    </div>
  );
}

export default Home;
