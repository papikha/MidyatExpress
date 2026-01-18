import api from "../api/axios";
import type { AxiosResponse } from "axios";
import { useEffect, useState, type JSX } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../redux/store";
import { getUser } from "../redux/slices/UserSlice";
import MessageButton from "../Components/MessageButton";
import { FaShoppingCart } from "react-icons/fa";
import { TiArrowBack } from "react-icons/ti";
import { useNavigate } from "react-router-dom";
import NotFound from "../Components/NotFound";

interface CartProduct {
  product_id: number;
  name: string;
  img_url: string;
  stock: number;
  price: number;
  new_price: number;
  desciption: string;
  quantity: number;
}

function Cart(): JSX.Element {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.user);
  const [products, setProducts] = useState<CartProduct[]>([]);

  useEffect(() => {
    dispatch(getUser());
  }, [dispatch]);

  useEffect(() => {
    if (!user?.id) return;

    const getProducts = async (): Promise<void> => {
      try {
        const response: AxiosResponse<CartProduct[]> = await api.post(
          "/cart",
          { id: user.id }
        );

        setProducts(response.data);
      } catch (error) {
        console.error("Ürünleri getirme hatası:", error);
      }
    };

    getProducts();
  }, [user?.id]);

  const isDiscounted = (product: CartProduct): boolean => {
    return product.new_price > 0 && product.new_price < product.price;
  };

  const getUnitPrice = (product: CartProduct): number => {
    if (isDiscounted(product)) {
      return product.new_price;
    }
    return product.price;
  };

  let subtotal = 0;

  for (let i = 0; i < products.length; i++) {
    const item = products[i];
    const unitPrice = getUnitPrice(item);
    const quantity = item.quantity;

    subtotal += unitPrice * quantity;
  }

  const removeProduct = async (product_id: number) => {
    try {
      await api.post("/cart/remove", { product_id, user_id: user?.id });

      setProducts((prev) =>
        prev.filter((item) => item.product_id !== product_id)
      );
    } catch (error) {
      console.error("Ürün silme hatası:", error);
    }
  };

  const increaseOrDecrease = (
    product_id: number,
    quantity: number,
    increase: boolean
  ) => {
    try {
      api.post("/cart/iord", { product_id, user_id: user?.id, increase });
      if (!increase && quantity <= 1) {
        setProducts((prev) =>
          prev.filter((item) => item.product_id !== product_id)
        );
      } else if (quantity >= 1) {
        setProducts((prev) =>
          prev.map((item) =>
            item.product_id === product_id
              ? {
                  ...item,
                  quantity: increase ? item.quantity + 1 : item.quantity - 1,
                }
              : item
          )
        );
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (!user) return <NotFound/>;
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-amber-100 via-orange-100 to-rose-100 flex justify-center p-6">
      <div
        onClick={() => navigate("/")}
        className="md:hidden fixed z-1000 flex right-5 bottom-5 items-center justify-center w-11 h-11 rounded-full bg-white/80 backdrop-blur-md shadow-lg cursor-pointer hover:scale-110 hover:shadow-xl active:scale-95 transition-all duration-300"
      >
        <TiArrowBack className="w-6 h-6 text-gray-700" />
      </div>
      <div className="w-full max-w-5xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight text-gray-800">
            Sepetim
          </h1>
          <span className="rounded-full bg-orange-500/10 px-4 py-1 text-sm font-medium text-orange-600">
            {products.length} Ürün
          </span>
        </div>

        {products.length === 0 ? (
          <div className="flex flex-row rounded-3xl bg-white p-10 text-center text-gray-500 shadow">
            Sepetiniz boş <FaShoppingCart className="w-6 h-6 ml-5" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/*products*/}
            <div className="lg:col-span-2 space-y-5">
              {products.map((item) => {
                const discounted = isDiscounted(item);
                const unitPrice = getUnitPrice(item);

                return (
                  <div
                    key={item.name}
                    className="group relative overflow-hidden rounded-3xl bg-white shadow-[0_20px_50px_rgba(0,0,0,0.12)] transition hover:shadow-[0_30px_70px_rgba(0,0,0,0.18)]"
                  >
                    {discounted && (
                      <span className="absolute top-4 left-4 z-10 rounded-full bg-red-500 px-3 py-1 text-xs font-semibold text-white">
                        Fırsatlı Ürün
                      </span>
                    )}

                    <div className="flex flex-col sm:flex-row gap-5 p-5">
                      {/*image*/}
                      <img
                        src={item.img_url}
                        alt={item.name}
                        className="h-36 w-36 flex-shrink-0 rounded-2xl object-cover"
                      />

                      {/*description*/}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h2 className="text-lg font-semibold text-gray-800">
                            {item.name}
                          </h2>
                          <p className="mt-1 text-sm text-gray-500">
                            {item.desciption}
                          </p>
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                          {/*quantity*/}
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() =>
                                increaseOrDecrease(
                                  item.product_id,
                                  item.quantity,
                                  false
                                )
                              }
                              className="h-9 w-9 rounded-full border border-gray-200 hover:bg-gray-100 cursor-pointer"
                            >
                              -
                            </button>
                            <span className="w-6 text-center font-medium">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                increaseOrDecrease(
                                  item.product_id,
                                  item.quantity,
                                  true
                                )
                              }
                              className="h-9 w-9 rounded-full border border-gray-200 hover:bg-gray-100 cursor-pointer"
                            >
                              +
                            </button>
                          </div>

                          {/*price*/}
                          <div className="text-right">
                            {discounted && (
                              <p className="text-sm line-through text-gray-400">
                                ₺{item.price}
                              </p>
                            )}

                            <p
                              className={`text-lg font-bold ${
                                discounted ? "text-red-600" : "text-green-600"
                              }`}
                            >
                              ₺{unitPrice}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/*remove*/}
                    <button
                      onClick={() => removeProduct(item.product_id)}
                      className="absolute top-4 right-4 text-sm text-gray-400 hover:text-red-500 transition"
                    >
                      Kaldır
                    </button>
                  </div>
                );
              })}
            </div>

            {/*summary*/}
            <div className="h-fit rounded-3xl bg-white/90 backdrop-blur-xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.12)]">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Sipariş Özeti
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Ara Toplam</span>
                  <span>₺{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Kargo Ücreti</span>
                  <span>₺{subtotal >= 1000 ? "0" : "50"}</span>
                </div>

                <div className="h-px w-full bg-gray-200" />

                <div className="flex justify-between text-base font-bold text-gray-800">
                  <span>Toplam</span>
                  <span>₺{subtotal >= 1000 ? subtotal.toFixed(2) : (subtotal + 50).toFixed(2)}</span>
                </div>
              </div>

              <button className="mt-6 w-full rounded-2xl bg-gradient-to-r from-orange-500 to-rose-500 py-3 text-white font-semibold shadow-lg hover:opacity-90 transition cursor-pointer">
                Ödemeye Geç
              </button>
            </div>
          </div>
        )}
      </div>
      {user?.id ? <MessageButton where="bottom" /> : ""}
    </div>
  );
}

export default Cart;
