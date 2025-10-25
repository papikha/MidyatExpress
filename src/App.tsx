import { Route, Routes } from "react-router-dom";
import "./css/App.css";
import Home from "./pages/Home";
import Login from "./Components/Login";
import Register from "./Components/Register";
import Confirm from "./pages/Confirm"
import Profilim from "./pages/Profilim";
import AdminPanel from "./pages/AdminPanel";
import NotFound from "./Components/NotFound";
import ProductDetails from "./pages/ProductDetails";

function App() {
  return (
    <div>
      <Routes>
        <Route path="*" element={<NotFound/>} />
        <Route path="/" element={<Home/>} />
        <Route path="/productDetails/:id" element={<ProductDetails/>} />
        <Route path="/Kayıt" element={<Register/>} />
        <Route path="/Giriş" element={<Login/>} />
        <Route path="/Onay" element={<Confirm/>} />
        <Route path="/Profilim" element={<Profilim/>} />
        <Route path="/Panel" element={<AdminPanel/>} />
      </Routes>
    </div>
  );
}

export default App;
