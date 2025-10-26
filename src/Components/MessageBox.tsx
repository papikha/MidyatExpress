import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../redux/store";
import { clearMessage } from "../redux/slices/MessageSlice";
import { useEffect, useState } from "react";

function MessageBox() {
  const dispatch = useDispatch<AppDispatch>();
  const { message, messageColor } = useSelector((state: RootState) => state.message);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(() => dispatch(clearMessage()), 300);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, dispatch]);

  if (!message) return null;

  return (
    <div
      className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 max-w-md w-full rounded-xl shadow-lg overflow-hidden transition-all duration-300
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
    >
      <div
        style={{ background: messageColor ?? "#ccc" }}
        className="flex items-center justify-center px-6 py-4 text-white font-semibold rounded-xl shadow-md text-center"
      >
        {message}
      </div>
    </div>
  );
}

export default MessageBox;