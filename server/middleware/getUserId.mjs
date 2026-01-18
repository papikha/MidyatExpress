import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY,
);

export const getUserId = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    req.user = null;
    return next();
  }

  const token = authHeader.replace("Bearer ", "");

  const { data: authUser, error: authError } = await supabase.auth.getUser(token);

  if (authError || !authUser?.user) {
    return res.status(401).json("Yetkisiz erişim");
  }
    
  const { data: user, error: userGetError } = await supabase
    .from("users")
    .select()
    .eq("id", authUser.user.id)
    .single();

    if (userGetError || !user) {
      return res.status(403).json("Yetkisiz Erişim");
    }

  req.user = user;

  next();
};
