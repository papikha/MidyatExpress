import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { supabase } from "../../../supabaseClient";

export interface Product {
  id: number;
  created_at: Date;
  stock: number;
  name: string;
  price: number;
  description: string;
  img_url?: string;
  new_price: number;
}

export interface ProductsState {
  products: Product[];
  error: string | null;
}

const initialState: ProductsState = {
  products: [],
  error: null,
};

export const getAllProducts = createAsyncThunk<Product[]>(
  "products",
  async (_, { rejectWithValue }) => {
    const { data, error } = await supabase
      .from("products")
      .select("*");

    if (error) {
      console.error(error);
      return rejectWithValue("Veri çekilemedi");
    }

    return (data ?? []) as Product[];
  }
);

export const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(
        getAllProducts.fulfilled,
        (state, action: PayloadAction<Product[]>) => {
          state.products = action.payload;
        }
      )
      .addCase(getAllProducts.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export default productSlice.reducer;
