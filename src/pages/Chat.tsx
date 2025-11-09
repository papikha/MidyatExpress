import { useState } from "react";
import { HiMenu } from "react-icons/hi";

function Chat(){
  const [showChat, setShowChat] = useState(false);
  const [activeUser, setActiveUser] = useState<string | null>(null);

  const users = ["Ahmet", "Ayşe", "Mehmet", "Elif", "Deniz"];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sol Panel - Kişiler */}
      <div
        className={`${
          showChat ? "hidden" : "flex"
        } sm:flex w-full sm:w-1/4 bg-white border-r border-gray-200 flex-col transition-all duration-300`}
      >
        {/* Arama Kutusu */}
        <div className="p-4 border-b border-gray-200">
          <input
            type="text"
            placeholder="Yeni kişi ara..."
            className="w-full px-3 py-2 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Kayıtlı Kişiler Listesi */}
        <div className="flex-1 overflow-y-auto">
          {users.map((name, idx) => (
            <div
              key={idx}
              onClick={() => {
                setActiveUser(name);
                setShowChat(true);
              }}
              className="flex items-center gap-3 p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
            >
              <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold">
                {name[0]}
              </div>
              <div>
                <p className="font-medium text-gray-800">{name}</p>
                <p className="text-sm text-gray-500 truncate">Son mesaj önizleme...</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sağ Panel - Konuşma Alanı */}
      <div
        className={`${
          showChat ? "flex" : "hidden"
        } sm:flex flex-1 flex-col bg-gray-50 transition-all duration-300`}
      >
        {/* Üst Başlık */}
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Hamburger Menü - Sadece küçük ekranda */}
            <button
              onClick={() => setShowChat(false)}
              className="sm:hidden text-gray-600 hover:text-gray-800"
            >
              <HiMenu className="text-2xl" />
            </button>
            <div>
              <p className="font-semibold text-gray-800 text-lg">
                {activeUser ?? "Kullanıcı"}
              </p>
              <p className="text-sm text-gray-500">Çevrimiçi</p>
            </div>
          </div>
          <button className="text-gray-500 hover:text-gray-700 transition">
            ⋮
          </button>
        </div>

        {/* Mesajlar Alanı */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-gray-50">
          {/* Gelen Mesaj */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold">
              {activeUser ? activeUser[0] : "?"}
            </div>
            <div className="bg-white px-4 py-2 rounded-2xl shadow-sm max-w-[75%] sm:max-w-xs">
              <p>Merhaba! Nasılsın?</p>
            </div>
          </div>

          {/* Giden Mesaj */}
          <div className="flex justify-end">
            <div className="bg-blue-500 text-white px-4 py-2 rounded-2xl shadow-sm max-w-[75%] sm:max-w-xs">
              <p>İyiyim, sen?</p>
            </div>
          </div>
        </div>

        {/* Mesaj Yazma Alanı */}
        <div className="p-3 sm:p-4 bg-white border-t border-gray-200 flex items-center gap-3">
          <input
            type="text"
            placeholder="Mesaj yaz..."
            className="flex-1 px-4 py-2 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
          />
          <button className="bg-blue-500 text-white px-4 sm:px-5 py-2 rounded-full hover:bg-blue-600 transition text-sm sm:text-base">
            Gönder
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
