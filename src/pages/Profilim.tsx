import type {RootState, AppDispatch } from "../redux/store";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getUser } from "../redux/slices/UserSlice";
import NotFound from "./NotFound"; // 404 sayfası

function Profilim() {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    dispatch(getUser());
  }, [dispatch]);
   //kayıtsızsa 404
  if (!user?.id) {
    return <NotFound />;
  }

  return (
    <div className="p-6 max-w-xl mx-auto bg-white shadow-md rounded-md mt-8">
      <h1 className="text-2xl font-bold mb-4">Profilim</h1>
      <p><strong>Ad:</strong> {user.user_name}</p>
      <p><strong>Email:</strong> {user.email}</p>
    </div>
  );
}

export default Profilim;
