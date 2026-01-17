import { AiOutlineMessage } from 'react-icons/ai'
import { useNavigate } from 'react-router-dom'

function MessageButton({ where = "bottom" }: { where?: "bottom" | "top" }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate("/sohbetlerim")}
      className={`
        fixed
        ${
          where === "bottom"
            ? "left-8 bottom-8 max-sm:left-5 max-sm:bottom-5"
            : "right-8 top-8 max-sm:right-5 max-sm:top-5"
        }
        w-14 h-14 lg:w-16 lg:h-16
        flex items-center justify-center
        rounded-full
        bg-gradient-to-br from-blue-500 to-blue-600
        shadow-xl shadow-blue-500/40
        hover:scale-110 hover:shadow-2xl
        active:scale-95
        transition-all duration-300 ease-out
        cursor-pointer
        z-[1000]
      `}
    >
      <AiOutlineMessage className="w-7 h-7 sm:w-9 sm:h-9 text-white drop-shadow-md" />
    </div>
  );
}

export default MessageButton;
