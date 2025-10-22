import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { supabase } from "../../../supabaseClient";

export interface User {
  id: string;
  user_name: string;
  email: string;
  balance: string;
  avatar_url: string;
}

export interface UserState {
  user: User | null;
  error: string | null;
  loading: boolean;
}

const initialState: UserState = {
  user: null,
  error: null,
  loading: false,
};

// 🔹 Giriş yapmış kullanıcıyı Supabase'den çek
export const getUser = createAsyncThunk<User>(
  "user/getUser",
  async (_, { rejectWithValue }) => {
    try {
      // Auth üzerinden kullanıcı ID'sini al
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;

      const userId = authData?.user?.id;
      if (!userId) throw new Error("Kullanıcı bulunamadı");

      // users tablosundan bilgilerini al
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", "fa4ba440-22e5-45f7-8237-3c1894cee3d0")
        .single(); // sadece tek kullanıcı döner

      if (error) throw error;
      return data as User;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    clearUser: (state) => {
      state.user = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(getUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.user = action.payload;
        state.error = null;
        state.loading = false;
      })
      .addCase(getUser.rejected, (state, action) => {
        state.error = action.payload as string;
        state.loading = false;
      });
  },
});

export const { clearUser } = userSlice.actions;
export default userSlice.reducer;
