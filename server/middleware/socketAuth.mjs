import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

export const socketAuth = async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error("NO_TOKEN"));
    }

    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !data?.user) {
      return next(new Error("INVALID_TOKEN"));
    }
    
    socket.userId = data.user.id;

    next();
  } catch (err) {
    next(new Error("SOCKET_AUTH_FAILED"));
  }
};
