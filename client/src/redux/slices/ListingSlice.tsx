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

export interface ListingsState {
  listings: Listing[];
  error: string | null;
}

const listingState: ListingsState = {
  listings: [],
  error: null,
};

export const getListings = createAsyncThunk("listings", async (_, thunkAPI) => {
  const { data } = await supabase
    .from("listings")
    .select("id, listing_name, listing_price, listing_queue, listing_description, image_paths, category")
    .order("listing_queue", { ascending: false }) // büyükten küçüğe
    .order("created_at", { ascending: true }); // küçükten büyüğe

  if (!data) return thunkAPI.rejectWithValue("ilanlar çekilemedi");
  return data;
});

export const listingSlice = createSlice({
  name: "listing",
  initialState: listingState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(
        getListings.fulfilled,
        (state, action: PayloadAction<Listing[]>) => {
          state.listings = action.payload;
        },
      )
      .addCase(getListings.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export default listingSlice.reducer;
