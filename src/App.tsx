import { Route, Routes } from "react-router-dom";
import "./css/App.css";
import Home from "./pages/Home";
import Login from "./Components/Login";
import Register from "./Components/Register";
import Confirm from "./Components/Confirm";
import Profilim from "./pages/Profilim";
import AdminPanel from "./pages/AdminPanel";
import NotFound from "./Components/NotFound";
import ProductDetails from "./pages/ProductDetails";
import Chat from "./pages/Chat";
import Cart from "./pages/Cart"
import useIsOnline from "./hooks/useIsOnline";
import { useEffect } from "react";
import axios from "axios";
import type { RootState } from "./redux/store";
import { useSelector } from "react-redux";

function App() {
  let isOnline = useIsOnline();
  const { user } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    if (!user?.id) return;

    const setOnlineStatus = async (online: boolean) => {
      await axios.post("/api/chat/setOnline", {
        is_online: online,
        last_seen: online ? null : new Date().toISOString(),
        id: user.id,
      });
    };

    // İlk yüklemede veya isOnline değiştiğinde
    setOnlineStatus(isOnline);

    const handleBeforeUnload = () => {
      const payload = {
        is_online: false,
        last_seen: new Date().toISOString(),
        id: user.id,
      };
      const blob = new Blob([JSON.stringify(payload)], {
        type: "application/json",
      });
      navigator.sendBeacon("/api/chat/setOnline", blob);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      // Cleanup: component unmount olduğunda offline yap
      handleBeforeUnload();
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isOnline, user?.id]);

  return (
    <div>
      <Routes>
        <Route path="*" element={<NotFound />} />
        <Route path="/" element={<Home />} />
        <Route path="/productDetails/:id" element={<ProductDetails />} />
        <Route path="/Kayıt" element={<Register />} />
        <Route path="/Giriş" element={<Login />} />
        <Route path="/Onay" element={<Confirm />} />
        <Route path="/Profilim" element={<Profilim />} />
        <Route path="/Panel" element={<AdminPanel />} />
        <Route path="/Sohbetlerim" element={<Chat />} />
        <Route path="/Sepetim" element={<Cart />} />
      </Routes>
    </div>
  );
}

export default App;
