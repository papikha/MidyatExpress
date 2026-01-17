import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface MessagesState {
  message: string | null;
  messageColor: string | null;
}

const initialState: MessagesState = {
  message: null,
  messageColor: null,
};

export const messageSlice = createSlice({
  name: "messages",
  initialState,
  reducers: {
    setMessage: (state, action: PayloadAction<{ message: string; messageColor?: string }>) =>{
        state.message = action.payload.message;
        state.messageColor = action.payload.messageColor ?? null;
    },
    clearMessage: (state) => {
      state.message = null;
      state.messageColor = null;
    },
  },
});
export const { setMessage, clearMessage } = messageSlice.actions;

export default messageSlice.reducer;
