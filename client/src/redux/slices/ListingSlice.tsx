import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { supabase } from "../../../supabaseClient";

export interface Listing {
  id: number;
  listing_name: string;
  listing_price: number;
  listing_description: string;
  listing_queue: number;
  image_paths?: string;
  category: string;
}

export interface Arg {
  page: number;
  category: string | null;
}

export interface ListingsState {
  listings: Listing[];
  error: string | null;
}

const listingState: ListingsState = {
  listings: [],
  error: null,
};

export const getListings = createAsyncThunk(
  "listings",
  async (arg: Arg, thunkAPI) => {
    const limit = 11;
    const from = (arg.page - 1) * limit;
    const to = from + limit - 1;
    if (arg.category) {
      const { data } = await supabase
        .from("listings")
        .select(
          "id, listing_name, listing_price, listing_queue, listing_description, image_paths, category",
        )
        .eq("category", arg.category)
        .order("listing_queue", { ascending: false }) // büyükten küçüğe
        .order("created_at", { ascending: true }) // küçükten büyüğe
        .range(from, to);

      if (!data) return thunkAPI.rejectWithValue("ilanlar çekilemedi");
      return data;
    } else {
      const { data } = await supabase
        .from("listings")
        .select(
          "id, listing_name, listing_price, listing_queue, listing_description, image_paths, category",
        )
        .order("listing_queue", { ascending: false }) // büyükten küçüğe
        .order("created_at", { ascending: true }) // küçükten büyüğe
        .range(from, to);

      if (!data) return thunkAPI.rejectWithValue("ilanlar çekilemedi");
      return data;
    }
  },
);

export const listingSlice = createSlice({
  name: "listing",
  initialState: listingState,
  reducers: {
    setListings: (state, action: PayloadAction<Listing[]>) => {
      state.listings = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(
        getListings.fulfilled,
        (state, action: PayloadAction<Listing[]>) => {
          if (action.payload.length === 0) {
            state.error = "Başka sayfa kalmadı";
            return;
          }
          state.listings = action.payload;
        },
      )
      .addCase(getListings.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});
export const { setListings } = listingSlice.actions;
export default listingSlice.reducer;
