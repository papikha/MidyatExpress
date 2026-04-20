import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getListings } from "../redux/slices/ListingSlice";
import type { RootState, AppDispatch } from "../redux/store";
import { useNavigate } from "react-router-dom";
import { TiArrowBack } from "react-icons/ti";

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
  const { listings } = useSelector((state: RootState) => state.listing);
  const categories: Record<string ,string> = {
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
    dispatch(getListings());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
        {listings.map((item: Listing) => {
          const img = item.image_paths
            ? (Object.values(item.image_paths) as string[])[0]
            : undefined;
          return (
            <div
              key={item.id}
              onClick={() => navigate(`/ilan/${item.id}`)}
              className="cursor-pointer bg-white rounded-2xl shadow-sm hover:shadow-lg transition overflow-hidden flex flex-col"
            >
              {/* resim */}
              <div className="h-40 bg-gray-100 relative">
                {img ? (
                  <img src={img} className="w-full h-full object-cover" />
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
      </div>
      <div
        onClick={() => navigate(-1)}
        className={` md:hidden fixed z-1000 flex right-2 bottom-5 items-center justify-center w-11 h-11 rounded-full bg-white/80 backdrop-blur-md shadow-lg cursor-pointer hover:scale-110 hover:shadow-xl active:scale-95 transition-all duration-300`}
      >
        <TiArrowBack className="w-6 h-6 text-gray-700" />
      </div>
    </div>
  );
}

export default Listings;
