import api from "../api/axios";
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
import NotFound from "../Components/NotFound";
import { supabase } from "../../supabaseClient";

interface User {
  id: string;
  user_name: string;
  avatar_url?: string;
  is_online: boolean;
  last_seen: string;
  last_message: string;
}

interface Messages {
  id: number;
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
    let newSocket: Socket | null = null;

    const connect = async () => {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token || !user?.id) return;

      newSocket = io("http://localhost:8000", {
        transports: ["websocket"],
        auth: { token },
      });

      setSocket(newSocket);

      try {
        const response = await api.post("/chat/users");
        setUsers(response.data);
        setUsersWithRoom(response.data);
      } catch (err) {
        console.error("Kullanıcı listesi alınamadı:", err);
      }
    };

    connect();

    return () => {
      if (newSocket) newSocket.disconnect();
    };
  }, [user]);

  const search = (e: any) => {
    const value = e.target.value;
    if (value.length < 3) return setUsers(usersWithRoom);
    lastKeyPressTime.current = Date.now();

    setTimeout(async () => {
      if (Date.now() - lastKeyPressTime.current >= 500) {
        try {
          const response = await api.get(`/chat/search?user_name=${value}`);
          setUsers(response.data);
        } catch (err) {
          console.error(err);
        }
      }
    }, 500);
  };

  const searchContacts = (e: any) => {
    const value = e.target.value;
    setUsers(usersWithRoom.filter((user) => user.user_name.includes(value)));
  };

  useEffect(() => {
    if (!socket) return;

    const handler = (data: Messages) => {
      setMessages((prev) => [...prev, data]);
    };

    socket.on("receive_message", handler);

    return () => {
      socket.off("receive_message", handler);
    };
  }, [socket]);

  const sendMessage = async (e: any) => {
    e.preventDefault();

    if (!activeUser) return;
    if (message.trim().length < 2) return;

    setMessage("");

    const roomId = [user?.id, activeUser.id].sort().join("_");

    socket?.emit("send_message", {
      room: roomId,
      message,
    });

    await api.post("/chat/sendMessage", {
      room: roomId,
      message,
    });
  };

  const getChats = async (room: string) => {
    setMessage("");

    const response: any = await api.post("/chat/getMessages", { room });

    const sortedMessages = (response.data || []).sort(
      (a: any, b: any) => a.id - b.id,
    );

    setMessages(sortedMessages);
  };

  if (!user) return <NotFound />;
  return (
    <div className="flex h-screen bg-gray-100">
      <div
        className={`${
          showChat ? "hidden" : "flex"
        } sm:flex flex-col w-full sm:w-1/4 bg-white border-r border-gray-200 shadow-sm`}
      >
        <div className="p-4 border-b border-gray-200">
          <input
            onChange={search}
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
                  const roomName = [user?.id, u.id].sort().join("_");
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
                <div className="flex flex-col w-full overflow-hidden">
                  <div className="flex flex-row w-full justify-between">
                    <p className="font-medium text-gray-800 truncate max-lg:text-sm">
                      {u.user_name}
                    </p>
                    <p
                      className={`${
                        u.is_online
                          ? "max-lg:text-sm font-semibold text-green-500"
                          : "text-sm text-gray-500"
                      }`}
                    >
                      {u?.is_online ? (
                        <span className="relative flex size-3 mt-1 mr-1">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex size-3 rounded-full bg-green-500"></span>
                        </span>
                      ) : (
                        <span className="relative inline-flex size-3 rounded-full bg-gray-400 mr-1 mt-1"></span>
                      )}
                    </p>
                  </div>
                  <p className="text-sm text-gray-500 truncate">
                    {u.last_message}
                  </p>
                </div>
              </div>
            ))}
        </div>
        {usersWithRoom[1] && (
          <div className="p-4 border-t border-gray-200">
            <input
              onChange={searchContacts}
              type="text"
              placeholder="Kişiler de Ara..."
              className="w-full px-4 py-2 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 text-gray-700"
            />
          </div>
        )}
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
                  <div className="flex flex-row items-center gap-3">
                    {activeUser.avatar_url ? (
                      <img
                        className="w-10 h-10 sm:w-10 sm:h-10 rounded-full"
                        src={activeUser.avatar_url}
                      />
                    ) : (
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold">
                        {activeUser.user_name[0]}
                      </div>
                    )}
                    <p className="font-semibold text-gray-800 text-lg">
                      {activeUser.user_name}
                    </p>
                  </div>
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
                            { addSuffix: true, locale: tr },
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
        onClick={() => navigate(-1)}
        className={`${
          !showChat || "hidden"
        } md:hidden fixed z-1000 flex right-2 bottom-20 items-center justify-center w-11 h-11 rounded-full bg-white/80 backdrop-blur-md shadow-lg cursor-pointer hover:scale-110 hover:shadow-xl active:scale-95 transition-all duration-300`}
      >
        <TiArrowBack className="w-6 h-6 text-gray-700" />
      </div>
    </div>
  );
}

export default Chat;
