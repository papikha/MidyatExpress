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
import { useEffect } from "react";
import api from "./api/axios";
import type { RootState } from "./redux/store";
import { useSelector } from "react-redux";

function App() {
  const { user } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    if (!user?.id) return;

    const heartbeat = () => {
      api.post("/chat/heartbeat").catch(() => {});
    };

    heartbeat();

    const interval = setInterval(heartbeat, 60_000);

    return () => {
      clearInterval(interval);
    };
  }, [user?.id]);

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
