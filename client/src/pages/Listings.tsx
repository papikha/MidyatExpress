import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getListings, setListings } from "../redux/slices/ListingSlice";
import type { RootState, AppDispatch } from "../redux/store";
import { useNavigate } from "react-router-dom";
import { TiArrowBack } from "react-icons/ti";
import { FaCircleArrowLeft, FaCircleArrowRight } from "react-icons/fa6";
import api from "../api/axios";
import { setMessage } from "../redux/slices/MessageSlice";
import MessageBox from "../Components/MessageBox";
import MessageButton from "../Components/MessageButton";
import { getUser } from "../redux/slices/UserSlice";

export interface Listing {
  id: number;
  listing_name: string;
  listing_price: number;
  listing_description: string;
  listing_queue: number;
  image_paths?: string;
  category: string;
}

function Listings() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.user);
  const { message } = useSelector((state: RootState) => state.message);
  const { listings } = useSelector((state: RootState) => state.listing);
  const [page, setPage] = useState<number>(1);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [seachingWords, setSearchingWord] = useState<string | null>(null);
  const [isSearched, setIsSearched] = useState<boolean>(false);
  const categories: Record<string, string> = {
    real_estate: "emlak",
    vehicles: "vasıta",
    spare_parts: "yedek parçalar",
    "second-hand": "ikinci-el",
    industry: "sanayi",
    job_listings: "iş ilanları",
    animals: "hayvanlar",
    hobbies_entertainment: "hobi & eğlence",
    fashion: "moda",
    home_living: "ev & yaşam",
  };

  useEffect(() => {
    dispatch(getUser());
  }, [dispatch]);

  useEffect(() => {
    dispatch(getListings({ page: page, category: activeCategory }));
  }, [dispatch, page]);
  useEffect(() => {
    if (isSearched == false) {
      setPage(1);
      dispatch(getListings({ page: page, category: activeCategory }));
      setIsSearched(false);
    }
  }, [activeCategory, isSearched]);

  const handleSearch = async (e: any) => {
    e.preventDefault();
    if (
      seachingWords === null ||
      seachingWords.trim() == "" ||
      seachingWords.trim().length < 3
    ) {
      return dispatch(
        setMessage({
          message: "Lütfen en az 3 harfli bir kelime yazın",
          messageColor: "#f23f3f",
        }),
      );
    }
    if (!user) return navigate("/kayıt");
    try {
      const { data } = await api.post("/listings/search", {
        words: seachingWords?.trim(),
      });
      dispatch(setListings(data));
      setIsSearched(true);
    } catch (error: any) {
      const errorMessage =
        (typeof error?.response?.data?.error === "string" &&
          error?.response.data.error) ||
        "Bir hata oluştu";
      return dispatch(
        setMessage({
          message: errorMessage,
          messageColor: "#f23f3f",
        }),
      );
    }
  };

  return (
    <div className="flex md:flex-row flex-col min-h-screen bg-gray-50 p-6">
      <div className="md:flex-1 max-md:mb-5 bg-white rounded-2xl shadow-sm p-4 h-fit flex flex-col gap-4">
        {/* arama */}
        <form onSubmit={(e) => handleSearch(e)} className="flex flex-row gap-2">
          <input
            type="text"
            onChange={(e) => setSearchingWord(e.target.value)}
            placeholder="İlanlarda ara..."
            className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-xl hover:bg-blue-600 transition cursor-pointer"
          >
            Ara
          </button>
        </form>

        {/* kategoriler */}
        <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible">
          <button
            onClick={() => {
              setActiveCategory(null);
              setIsSearched(false);
            }}
            className="whitespace-nowrap px-3 py-2 rounded-xl text-sm font-medium text-gray-700 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 transition"
          >
            tüm ilanları göster
          </button>
          {Object.entries(categories).map(([key, value]) => (
            <button
              key={key}
              onClick={() => {
                setActiveCategory(key);
                setIsSearched(false);
              }}
              className="whitespace-nowrap px-3 py-2 rounded-xl text-sm font-medium text-gray-700 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 transition"
            >
              {value}
            </button>
          ))}
        </div>

        {/* ilanlar */}
      </div>
      <div className="md:flex-3 lg:flex-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {listings.map((item: Listing) => {
          const img = item.image_paths
            ? (Object.values(item.image_paths) as string[])[0]
            : undefined;
          return (
            <div
              key={item.id}
              onClick={() => navigate(`/ilan/${item.id}`)}
              className="max-h-[300px] cursor-pointer bg-white rounded-2xl shadow-sm hover:shadow-lg transition overflow-hidden flex flex-col"
            >
              {/* resim */}
              <div className="h-40 bg-gray-100 relative">
                {img ? (
                  <div className="h-40 bg-gray-200 flex items-center justify-center">
                    <img
                      src={img}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                    Resim yok
                  </div>
                )}

                <div className="absolute bottom-2 right-2 bg-yellow-500 text-white text-sm font-bold px-3 py-1 rounded-full shadow whitespace-nowrap">
                  {item.listing_price} ₺
                </div>
              </div>

              <div className="p-3 flex flex-col gap-1">
                {/* başlık */}
                <h2 className="text-sm font-semibold text-gray-800 truncate">
                  {item.listing_name}
                </h2>

                {/* kategori */}
                <span className="text-[11px] text-blue-600 font-medium">
                  {categories[item.category]}
                </span>

                {/* açıklama */}
                <p className="text-xs text-gray-500 line-clamp-2">
                  {item.listing_description}
                </p>
              </div>
            </div>
          );
        })}
        {/* sonraki-önceki sayfa */}
        {!isSearched && page > 1 && (
          <div className="flex flex-col gap-3 min-h-[258px] max-h-[300px] ">
            <button
              onClick={() => setPage((prev) => prev + 1)}
              className={`${listings.length < 11 && "hidden"} cursor-pointer bg-white rounded-2xl shadow-sm hover:shadow-lg transition flex flex-col items-center justify-center gap-3 min-h-[124px] max-h-[150px] `}
            >
              <span className="text-sm font-semibold text-gray-700">
                {page + 1}. Sayfa
              </span>
              <div className="text-2xl text-gray-500">
                <FaCircleArrowRight />
              </div>
            </button>
            <button
              onClick={() => setPage((prev) => prev - 1)}
              className={`${listings.length < 11 ? "min-h-[258px] max-h-[300px] " : "min-h-[124px] max-h-[150px] "} cursor-pointer bg-white rounded-2xl shadow-sm hover:shadow-lg transition flex flex-col items-center justify-center gap-3`}
            >
              <span className="text-sm font-semibold text-gray-700">
                {page - 1}. Sayfa
              </span>
              <div className="text-2xl text-gray-500">
                <FaCircleArrowLeft />
              </div>
            </button>
          </div>
        )}{" "}
        {!isSearched && page == 1 && (
          <button
            onClick={() => setPage((prev) => prev + 1)}
            className={`${listings.length < 11 && "hidden"} cursor-pointer bg-white rounded-2xl shadow-sm hover:shadow-lg transition flex flex-col items-center justify-center gap-3 min-h-[258px] max-h-[300px]`}
          >
            <span className="text-sm font-semibold text-gray-700">
              {page + 1}. Sayfa
            </span>
            <div className="text-2xl text-gray-500">
              <FaCircleArrowRight />
            </div>
          </button>
        )}
      </div>
      <div
        onClick={() => navigate(-1)}
        className={` md:hidden fixed z-1000 flex right-2 bottom-5 items-center justify-center w-11 h-11 rounded-full bg-white/80 backdrop-blur-md shadow-lg cursor-pointer hover:scale-110 hover:shadow-xl active:scale-95 transition-all duration-300`}
      >
        <TiArrowBack className="w-6 h-6 text-gray-700" />
      </div>
      {message && <MessageBox />}
      {user?.id && <MessageButton where="bottom" />}
    </div>
  );
}

export default Listings;
