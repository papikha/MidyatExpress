import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import { FaQuestion, FaRegEye } from "react-icons/fa";
import api from "../api/axios";
import { TiArrowBack } from "react-icons/ti";

interface Listing {
  id: number;
  listing_name: string;
  listing_description: string;
  listing_price: number;
  created_at: string;
  image_paths: Record<string, string> | null;
  seen: number;
}

interface Seller {
  user_name: string;
  real_name: string;
  real_surname: string;
  avatar_url: string;
  is_online: boolean;
  last_seen: string;
  created_at: string;
  total_listings: number;
}

export default function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [seller, setSeller] = useState<Seller>();

  // expire 30 gün
  const getRemainingTime = (createdAt: string): string => {
    const end = new Date(createdAt).getTime() + 30 * 24 * 60 * 60 * 1000;

    const diff = end - Date.now();
    if (diff <= 0) return "Süre doldu";

    const d = Math.floor(diff / (24 * 60 * 60 * 1000));
    const h = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const m = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));

    return `${d}g ${h}s ${m}dk`;
  };

  const getTime = (createdAt?: string) => {
    if (!createdAt) return "Bilinmiyor";

    const then = new Date(createdAt);
    if (isNaN(then.getTime())) return "Bilinmyor";

    const diff = Date.now() - then.getTime();

    const year = Math.floor(diff / (365 * 24 * 60 * 60 * 1000));
    if (year >= 1) return `${year} yıl`;

    const month = Math.floor(diff / (30 * 24 * 60 * 60 * 1000));
    if (month >= 1) return `${month} ay`;

    const day = Math.floor(diff / (24 * 60 * 60 * 1000));
    if (day >= 1) return `${day} gün`;

    const hour = Math.floor(diff / (60 * 60 * 1000));
    if (hour >= 1) return `${hour} saat`;

    return "Az önce";
  };

  useEffect(() => {
    if (!id || isNaN(Number(id))) {
      navigate("/");
      return;
    }

    const fetchListing = async () => {
      const { data: listing, error: listingError } = await supabase
        .from("listings")
        .select("*")
        .eq("id", Number(id))
        .single();

      if (listingError || !listing) {
        navigate("/");
        return;
      }

      const { data: sellerData } = await api.post("/users/listing", {
        listing_id: listing?.id,
      });
      if (!sellerData.real_name) return;
      setSeller(sellerData);

      setListing(listing);
      setLoading(false);
    };

    fetchListing();
  }, [id, navigate]);

  if (loading || !listing) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Yükleniyor...
      </div>
    );
  }

  const images: string[] = listing.image_paths
    ? Object.values(listing.image_paths).filter(
        (img): img is string => typeof img === "string" && img.length > 0,
      )
    : [];

  return (
    <div className="bg-gray-100 min-h-screen py-6">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ilan */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow overflow-hidden">
          {/* resimler */}
          <div className="relative">
            <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide">
              {images.length > 0 ? (
                images.map((img, i) => (
                  <div
                    key={i}
                    className="w-full h-[420px] flex-shrink-0 snap-center bg-black"
                  >
                    <img
                      src={img}
                      alt={`ilan-${i}`}
                      className="w-full h-full object-contain"
                    />
                  </div>
                ))
              ) : (
                <div className="w-full h-[420px] flex items-center justify-center bg-gray-200 text-gray-400">
                  Resim yok
                </div>
              )}
            </div>

            <span className="absolute top-3 right-3 text-[11px] bg-black/70 text-white px-2 py-[3px] rounded-full">
              {getRemainingTime(listing.created_at)}
            </span>

            <span className="absolute bottom-3 right-3 bg-amber-400 text-white font-bold px-4 py-1 rounded-full shadow">
              {listing.listing_price} ₺
            </span>
          </div>

          {/* ilan yazıları */}
          <div className="p-5 space-y-4">
            <div className="flex w-full justify-between">
              <h1 className="text-xl font-bold text-gray-900">
                {listing.listing_name}
              </h1>
              <div className="flex flex-col items-center justify-center opacity-[0.4] ">
                <FaRegEye />
                <p className="text-sm -mt-1">{listing.seen}</p>
              </div>
            </div>

            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
              {listing.listing_description}
            </p>
          </div>
        </div>

        {/* satıcı bilgisi */}
        <div className="bg-white rounded-2xl shadow p-5 h-fit space-y-5">
          <div className="flex items-center gap-4">
            <img
              src={seller?.avatar_url}
              className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-lg"
            ></img>

            <div className="flex-1">
              <p className="font-semibold text-gray-800">{seller?.user_name}</p>
              <p className="text-xs text-gray-400">
                {seller?.real_name && seller.real_name.length > 10
                  ? seller?.real_name.slice(0, 10) + "..."
                  : seller?.real_name}{" "}
                {seller?.real_surname && seller.real_surname.length > 10
                  ? seller?.real_surname.slice(0, 10) + "..."
                  : seller?.real_surname}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-gray-50 rounded-xl py-3">
              <p className="text-sm font-semibold text-gray-800">
                {seller?.total_listings}
              </p>
              <p className="text-[11px] text-gray-400">İlan</p>
            </div>

            <div className="bg-gray-50 rounded-xl py-3">
              <p className="text-sm font-semibold text-gray-800">
                {seller && getTime(seller?.created_at)}
              </p>
              <p className="text-[11px] text-gray-400">Üyelik</p>
            </div>
          </div>

          {/* satıcıya mesaj */}
          <div className="space-y-2">
            <button
              onClick={() => navigate("/sohbetlerim")}
              className="w-full bg-amber-400 hover:bg-amber-500 transition text-white font-semibold py-2 rounded-xl text-sm"
            >
              Satıcıya Mesaj At
            </button>
          </div>

          <div className="text-xs text-green-500 text-center">
            Telefon numarası ile doğrulanmış
            <br />
            Son aktif: {getTime(seller?.last_seen)}
          </div>
        </div>

        {/* SORU – CEVAP */}
        <div className="lg:col-span-3 bg-white rounded-2xl shadow p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Soru & Cevap</h2>

          {/* SORULAR */}
          <div className="space-y-4 mb-6">
            <div className="bg-gray-50 rounded-xl p-3 truncate">
              <p className="flex flex-row items-center text-sm text-gray-800">
                <FaQuestion className="max-w-6 max-h-6 mr-1 -mt-1 text-red-500" />{" "}
                Eve Teslim Var mı?
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Evet, eve teslim bulunuyor biza yazıp adresinizi verirseniz
                teslim edebilirim.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-3 overflow-hidden ">
              <p className="flex flex-row items-center text-sm text-gray-800">
                <FaQuestion className="max-w-6 max-h-6 mr-1 -mt-1 text-red-500" />{" "}
                <span>
                  İlk sahibi misiniz yoksa sizde mi 2. el aldınız j jjjjjjjjjjj
                  jjjjjjjjjjjjj
                </span>
              </p>
              <p className="text-xs text-gray-500 mt-1">Evet, ilk sahibiyim.</p>
            </div>
          </div>
        </div>
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
