import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { HiMenu } from "react-icons/hi";
import type { AppDispatch, RootState } from "../redux/store";
import { useDispatch, useSelector } from "react-redux";
import { getUser } from "../redux/slices/UserSlice";
import { io, Socket } from "socket.io-client";
import logo from "../images/Logo.png";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import { IoSend } from "react-icons/io5";
import { TiArrowBack } from "react-icons/ti";

interface User {
  id: string;
  user_name: string;
  avatar_url?: string;
  is_online: boolean;
  last_seen: string;
}

interface Messages {
  created_at: string;
  room_id: string;
  message: string;
  sender_id: string;
}

function Chat() {
  const [showChat, setShowChat] = useState(false);
  const [activeUser, setActiveUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [usersWithRoom, setUsersWithRoom] = useState<User[]>([]);
  const { user } = useSelector((state: RootState) => state.user);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<Messages[]>([]);
  const [room, setRoom] = useState<string>("");

  const lastKeyPressTime = useRef(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(getUser());
  }, [dispatch]);

  useEffect(() => {
    if (!user?.id) return;

    const newSocket = io("http://localhost:8000", {
      transports: ["websocket"],
    });

    newSocket.on("connect", () => {
      newSocket.emit("join", { userId: user.id });
    });

    setSocket(newSocket);

    const getUsers = async () => {
      try {
        const response = await axios.post("/api/chat/users", { id: user.id });
        setUsers(response.data);
        setUsersWithRoom(response.data);
      } catch (err) {
        console.error("Kullanıcı listesi alınamadı:", err);
      }
    };

    getUsers();

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  const searching = (e: any) => {
    const value = e.target.value;
    if (value.length < 3) return setUsers(usersWithRoom);
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

  useEffect(() => {
    socket?.on("receive_message", (data) => {
      setMessages((prev: any) => [...prev, data]);
    });
  }, [socket]);

  const sendMessage = async (e: any) => {
    e.preventDefault();
    if (!activeUser) return;
    if (message.length < 2) return;
    setMessage("");

    const exists = usersWithRoom.some((u) => u.id === activeUser.id);
    if (!exists) {
      try {
        await axios.post("/api/chat/addRoom", {
          user1_id: user?.id,
          user2_id: activeUser?.id,
        });
      } catch (error) {
        console.error(error);
        return;
      }
    }
    socket?.emit("send_message", { room, message, sender_id: user?.id });
    await axios.post("/api/chat/sendMessage", {
      room,
      message,
      sender_id: user?.id,
    });
  };

  const getChats = async (room: string) => {
    setMessage("");
    const response: any = await axios.post("/api/chat/getMessages", { room });
    setMessages(response.data || []);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <div
        className={`${
          showChat ? "hidden" : "flex"
        } sm:flex flex-col w-full sm:w-1/4 bg-white border-r border-gray-200 shadow-sm`}
      >
        <div className="p-4 border-b border-gray-200">
          <input
            onChange={searching}
            type="text"
            placeholder="Yeni kişi ara..."
            className="w-full px-4 py-2 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 text-gray-700"
          />
        </div>

        <div className="flex-1 overflow-y-auto h-[calc(100vh-64px)] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {users
            .filter((u) => u.id !== user?.id)
            .map((u) => (
              <div
                key={u.id}
                onClick={() => {
                  setActiveUser(u);
                  const roomName = [user?.id, u.id].sort().join("-");
                  setRoom(roomName);
                  socket?.emit("join_room", roomName);
                  getChats(roomName);
                  setShowChat(true);
                }}
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-100"
              >
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
                    {/* son mesaj */}
                  </p>
                </div>
              </div>
            ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col h-screen">
        {activeUser ? (
          <>
            <div
              className={`${
                showChat || "max-sm:hidden"
              } px-4 sm:px-6 py-4 border-b border-gray-200 bg-white flex items-center justify-between`}
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowChat(false)}
                  className="sm:hidden text-gray-600 hover:text-gray-800"
                >
                  <HiMenu className="text-2xl cursor-pointer" />
                </button>
                <div>
                  <p className="font-semibold text-gray-800 text-lg">
                    {activeUser.user_name}
                  </p>
                  <p
                    className={`${
                      activeUser.is_online
                        ? "text-md font-semibold text-green-500"
                        : "text-sm text-gray-500"
                    }`}
                  >
                    {activeUser?.is_online
                      ? "Çevrimiçi"
                      : activeUser.last_seen
                      ? `Son görülme: ${formatDistanceToNow(
                          new Date(activeUser.last_seen),
                          { addSuffix: true, locale: tr }
                        )}`
                      : "Bilinmiyor"}
                  </p>
                </div>
              </div>
              <img
                src={logo}
                onClick={() => navigate("/")}
                className="w-10 h-10 rounded-full mb-3 opacity-80 border-1 border-blue-700 cursor-pointer"
              />
            </div>

            <div
              className={`${
                showChat || "max-sm:hidden"
              } flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-gray-50`}
            >
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`${
                    msg.sender_id === user?.id
                      ? "flex justify-end"
                      : "flex items-start gap-3"
                  }`}
                >
                  {msg.sender_id !== user?.id && (
                    <div>
                      {activeUser.avatar_url ? (
                        <img
                          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full"
                          src={activeUser.avatar_url}
                        />
                      ) : (
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold">
                          {activeUser.user_name[0]}
                        </div>
                      )}
                    </div>
                  )}
                  <div
                    className={`relative px-4 py-2 rounded-2xl shadow-sm max-w-[75%] sm:max-w-xs ${
                      msg.sender_id === user?.id
                        ? "bg-blue-500 text-white rounded-br-md"
                        : "bg-white text-gray-800 rounded-bl-md"
                    }`}
                  >
                    <p className="text-sm leading-relaxed break-words max-w-120">
                      {msg.message}
                    </p>

                    <div className="flex justify-end mt-1">
                      {msg.created_at &&
                        !isNaN(new Date(msg.created_at).getTime()) && (
                          <span
                            className={`text-[11px] select-none ${
                              msg.sender_id === user?.id
                                ? "text-blue-100"
                                : "text-gray-400"
                            }`}
                          >
                            {formatDistanceToNow(new Date(msg.created_at), {
                              addSuffix: true,
                              locale: tr,
                            })}
                          </span>
                        )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <form
              onSubmit={sendMessage}
              className={`${
                showChat || "max-sm:hidden"
              } p-3 sm:p-4 bg-white border-t border-gray-200 flex items-center gap-3`}
            >
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                type="text"
                placeholder="Mesaj yaz..."
                className="flex-1 px-4 py-2 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              />
              <button
                type="submit"
                className="bg-blue-500 text-white max-sm:px-3 sm:px-5 py-2 rounded-full hover:bg-blue-600 transition text-sm sm:text-base"
              >
                <IoSend />
              </button>
            </form>
          </>
        ) : (
          <div className="max-sm:hidden flex flex-col items-center justify-center w-full h-full text-center text-gray-600 select-none">
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
      <div
        onClick={() => navigate("/")}
        className={`${!showChat || "hidden"} md:hidden fixed z-1000 flex left-2 bottom-2 items-center justify-center w-11 h-11 rounded-full bg-white/80 backdrop-blur-md shadow-lg cursor-pointer hover:scale-110 hover:shadow-xl active:scale-95 transition-all duration-300`}
      >
        <TiArrowBack className="w-6 h-6 text-gray-700" />
      </div>
    </div>
  );
}

export default Chat;
