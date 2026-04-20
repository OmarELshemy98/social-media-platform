import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../services/api";

const initialState = {
  profileUser: null,
  profilePosts: [],
  status: "idle",
  error: null,
};

export const fetchProfileByUsername = createAsyncThunk(
  "profile/fetchByUsername",
  async (username, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/profiles/${username}`);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to load profile");
    }
  }
);

export const updateMyProfile = createAsyncThunk(
  "profile/updateMyProfile",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.put("/profiles/me/update", payload);
      return data.user;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update profile");
    }
  }
);

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfileByUsername.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchProfileByUsername.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.profileUser = action.payload.user;
        state.profilePosts = action.payload.posts;
      })
      .addCase(fetchProfileByUsername.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(updateMyProfile.fulfilled, (state, action) => {
        state.profileUser = action.payload;
      });
  },
});

export default profileSlice.reducer;
