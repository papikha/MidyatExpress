import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { getAllProducts } from "../redux/slices/ProductSlice";
import type { RootState, AppDispatch } from "../redux/store";
import { TiArrowBack } from "react-icons/ti";
import MessageButton from "../Components/MessageButton";

function NewProductDetails() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { products } = useSelector((state: RootState) => state.products);
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    dispatch(getAllProducts());
  }, [dispatch]);

  const product = products.find((p) => p.id.toString() === id);

  if (!product)
    return (
      <div className="min-h-screen flex items-center justify-center text-2xl text-gray-500">
        Ürün bulunamadı...
      </div>
    );

  return (
    <div className="min-h-screen w-screen bg-gray-50 flex flex-col md:flex-row items-center md:items-start p-6 md:p-15 md:pt-6 pb-40">
      <div
        onClick={() => navigate("/")}
        className="md:hidden fixed z-1000 flex left-5 items-center justify-center w-11 h-11 rounded-full bg-white/80 backdrop-blur-md shadow-lg cursor-pointer hover:scale-110 hover:shadow-xl active:scale-95 transition-all duration-300"
      >
        <TiArrowBack className="w-6 h-6 text-gray-700" />
      </div>

      <div className="flex-shrink-0 w-32 h-32 md:w-64 md:h-64 lg:w-80 lg:h-80 flex justify-center items-center bg-gray-100 rounded-2xl shadow-lg relative mb-6 md:mb-0">
        {product.new_price && (
          <div className="absolute top-2 left-2 bg-red-500 text-white font-bold px-3 py-1 rounded-full text-sm md:text-base animate-pulse z-10">
            Fırsat
          </div>
        )}
        <img
          src={product.img_url}
          alt={product.name}
          className="w-28 h-28 md:w-64 md:h-64 lg:w-80 lg:h-80 object-contain rounded-xl"
        />
      </div>

      <div className="flex flex-col md:ml-10 gap-4 max-w-xl text-center md:text-left md:mb-60 mb-20">
        <h1
          className={`text-2xl md:text-4xl font-extrabold ${
            product.new_price ? "text-red-700" : "text-green-700"
          }`}
        >
          {product.name}
        </h1>
        <p className="text-gray-700 text-sm md:text-lg leading-relaxed">
          {product.description}
        </p>

        <div className="flex justify-center md:justify-start items-center gap-4 mt-2">
          {product.new_price && product.new_price < product.price ? (
            <>
              <span className="text-gray-400 line-through text-sm md:text-lg">
                ${product.price.toFixed(2)}
              </span>
              <span className="text-red-600 text-lg md:text-2xl font-bold animate-pulse">
                ${product.new_price.toFixed(2)}
              </span>
            </>
          ) : (
            <span className="text-green-600 text-lg md:text-2xl font-bold">
              ${product.price.toFixed(2)}
            </span>
          )}
        </div>

        <p className="text-gray-500 text-sm md:text-base">
          Stok durumu: {product.stock || "Stokta yok"}
        </p>

        <button className="mt-4 mb-10 bg-green-600 hover:bg-green-700 text-white font-bold py-2 md:py-3 px-6 rounded-lg shadow-lg transition transform hover:scale-105">
          Sepete Ekle
        </button>
      </div>

      <div className="fixed bottom-0 left-0 w-full bg-gradient-to-r from-red-50 via-white to-pink-50 border-t border-gray-200 shadow-inner z-50 p-4 md:p-6">
        <h3 className="text-lg md:text-2xl font-bold text-red-600 mb-4">
          Kaçırma 🔥
        </h3>
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex space-x-4 md:space-x-6">
            {products
              .filter((p) => p.new_price)
              .map((p) => (
                <div
                  key={p.id}
                  className="w-24 md:w-32 flex-shrink-0 bg-white rounded-2xl p-2 shadow-md flex flex-col items-center justify-between transition-transform hover:scale-105 duration-300"
                >
                  <img
                    src={p.img_url}
                    alt={p.name}
                    className="w-12 h-12 md:w-20 md:h-20 object-contain mb-2"
                  />
                  <h4 className="text-xs md:text-sm font-semibold text-red-800 text-center">
                    {p.name}
                  </h4>
                  <div className="flex flex-col items-center">
                    <span className="text-gray-400 line-through text-xs md:text-sm">
                      ${p.price.toFixed(2)}
                    </span>
                    <span className="text-red-600 font-bold text-sm md:text-base">
                      ${p.new_price.toFixed(2)}
                    </span>
                  </div>
                  <button
                    onClick={() => navigate(`/productDetails/${p.id}`)}
                    className="mt-2 bg-red-500 text-white text-xs md:text-sm px-3 py-1 rounded-lg hover:bg-red-600 transition"
                  >
                    İncele
                  </button>
                </div>
              ))}
          </div>
        </div>
      </div>
      <MessageButton where="top" />
    </div>
  );
}

export default NewProductDetails;
