import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

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
    try {
      const response = await axios.get<Product[]>("/api/products");
      return response.data;
    } catch (err: any) {
      console.error(err);
      return rejectWithValue(err.response?.data?.error || "Veri çekilemedi");
    }
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
