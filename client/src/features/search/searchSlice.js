import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../services/api";

const initialState = {
  users: [],
  posts: [],
  query: "",
  status: "idle",
};

export const runGlobalSearch = createAsyncThunk("search/run", async (query) => {
  const { data } = await api.get("/search", { params: { q: query } });
  return { ...data, query };
});

const searchSlice = createSlice({
  name: "search",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(runGlobalSearch.pending, (state) => {
        state.status = "loading";
      })
      .addCase(runGlobalSearch.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.users = action.payload.users;
        state.posts = action.payload.posts;
        state.query = action.payload.query;
      });
  },
});

export default searchSlice.reducer;
