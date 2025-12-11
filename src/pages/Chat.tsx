import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { HiMenu } from "react-icons/hi";
import type { AppDispatch, RootState } from "../redux/store";
import { useDispatch, useSelector } from "react-redux";
import { getUser } from "../redux/slices/UserSlice";
import { io, Socket } from "socket.io-client";
import logo from "../images/Logo.png";
import { useNavigate } from "react-router-dom";

interface User {
  id: string;
  user_name: string;
  avatar_url?: string;
}

function Chat() {
  const [showChat, setShowChat] = useState(false);
  const [activeUser, setActiveUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const { user } = useSelector((state: RootState) => state.user);
  const [socket, setSocket] = useState<Socket | null>(null);
  const lastKeyPressTime = useRef(0);

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(getUser());
  }, [dispatch]);

  useEffect(() => {
    if (!user?.id) return;

    const getUsers = async () => {
      try {
        const response = await axios.post("/api/chat/users", { id: user.id });
        setUsers(response.data);
      } catch (err) {
        console.error("Kullanıcı listesi alınamadı:", err);
      }
    };

    getUsers();
  }, [user]);

  useEffect(() => {
    if (!user?.id) return;

    const newSocket = io("http://localhost:8000", {
      transports: ["websocket"],
    });

    newSocket.on("connect", () => {
      newSocket.emit("join", { userId: user.id });
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  const searching = (e: any) => {
    const value = e.target.value;
    if (value.length < 3) return;
    lastKeyPressTime.current = Date.now();

    setTimeout(async () => {
      if (Date.now() - lastKeyPressTime.current >= 500) {
        try {
          const response = await axios.get(
            `/api/chat/search?user_name=${value}`
          );
          setUsers(response.data);
        } catch (err) {
          console.error(err);
        }
      }
    }, 500);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <div
        className={`${
          showChat ? "hidden" : "flex"
        } sm:flex w-full sm:w-1/4 bg-white border-r border-gray-200 flex-col transition-all duration-300 shadow-sm`}
      >
        {/* Arama çubuğu */}
        <div className="p-4 border-b border-gray-200">
          <input
            onChange={searching}
            type="text"
            placeholder="Yeni kişi ara..."
            className="w-full px-4 py-2 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 text-gray-700"
          />
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {users
            .filter((u) => u.user_name !== user?.user_name)
            .map((u) => (
              <div
                key={u.id || u.user_name}
                onClick={() => {
                  setActiveUser(u);
                  setShowChat(true);
                }}
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-100"
              >
                {/*Avatar resmi*/}
                {u.avatar_url ? (
                  <img
                    className="w-12 h-12 rounded-full object-cover"
                    src={u.avatar_url}
                    alt={u.user_name}
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold text-lg">
                    {u.user_name[0].toUpperCase()}
                  </div>
                )}
                <div className="flex flex-col overflow-hidden">
                  <p className="font-medium text-gray-800 truncate">
                    {u.user_name}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {/*son mesaj*/}
                  </p>
                </div>
              </div>
            ))}
        </div>
      </div>

      <div className="w-full h-screen">
        {activeUser?.user_name ? (
          <div
            className={`${
              showChat ? "flex" : "hidden"
            } sm:flex flex-1 flex-col bg-gray-50 transition-all duration-300`}
          >
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowChat(false)}
                  className="sm:hidden text-gray-600 hover:text-gray-800"
                >
                  <HiMenu className="text-2xl" />
                </button>
                <div>
                  <p className="font-semibold text-gray-800 text-lg">
                    {activeUser.user_name}
                  </p>
                  <p className="text-sm text-gray-500">Çevrimiçi</p>
                </div>
              </div>
              <img
                src={logo}
                onClick={() => navigate("/")}
                className="w-10 h-10 rounded-full mb-3 opacity-80 border-1 border-blue-700 cursor-pointer"
              />
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-gray-50">
              <div className="flex items-start gap-3">
                {activeUser.avatar_url ? (
                  <img
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full"
                    src={activeUser.avatar_url}
                  />
                ) : (
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold">
                    {activeUser ? activeUser.user_name[0] : "?"}
                  </div>
                )}
                <div className="bg-white px-4 py-2 rounded-2xl shadow-sm max-w-[75%] sm:max-w-xs">
                  <p>Merhaba! Nasılsın?</p>
                </div>
              </div>

              <div className="flex justify-end">
                <div className="bg-blue-500 text-white px-4 py-2 rounded-2xl shadow-sm max-w-[75%] sm:max-w-xs">
                  <p>İyiyim, sen?</p>
                </div>
              </div>
            </div>

            <div className="fixed bottom-0 p-3 w-full sm:p-4 bg-white border-t border-gray-200 flex items-center gap-3">
              <input
                type="text"
                placeholder="Mesaj yaz..."
                className="lg:w-[70%] sm:w-[57%] md:w-[65%] w-[85%] px-4 py-2 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              />
              <button className="bg-blue-500 text-white px-4 sm:px-5 py-2 rounded-full hover:bg-blue-600 transition text-sm sm:text-base">
                Gönder
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center w-full h-full text-center text-gray-600 select-none">
            <img
              src={logo}
              onClick={() => navigate("/")}
              className="w-16 h-16 rounded-full mb-3 opacity-80 cursor-pointer"
            />
            <h1 className="text-xl font-semibold text-gray-700 mb-1">
              Sohbete Başla
            </h1>
            <p className="text-sm text-gray-500">
              Soldan bir kişi seçerek konuşmaya başlayabilirsin.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Chat;
