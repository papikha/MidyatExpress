import { Route, Routes } from "react-router-dom";
import "./css/App.css";
import Home from "./pages/Home";
import Login from "./Components/Login";
import Register from "./Components/Register";

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/Kayıt" element={<Register/>} />
        <Route path="/Giriş" element={<Login/>} />
      </Routes>
    </div>
  );
}

export default App;
