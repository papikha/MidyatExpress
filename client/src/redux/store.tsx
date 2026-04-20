import { configureStore } from '@reduxjs/toolkit'
import ProductReducer from './slices/ProductSlice'
import UserReducer from './slices/UserSlice'
import MessageReducer from "./slices/MessageSlice";
import ListingsReducer from "./slices/ListingSlice"

export const store = configureStore({
  reducer: {
    products : ProductReducer,
    user : UserReducer,
    message : MessageReducer,
    listing : ListingsReducer,
  },
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch