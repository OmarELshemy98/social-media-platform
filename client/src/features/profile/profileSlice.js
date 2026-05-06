import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../services/api";

const initialState = {
  profileUser: null,
  profilePosts: [],
  suggestions: [],
  relationship: "none", // 'none' | 'friends' | 'request_sent' | 'request_received' | 'blocked'
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

export const sendFriendRequest = createAsyncThunk(
  "profile/sendFriendRequest",
  async (userId, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/profiles/${userId}/friend-request`);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to send request");
    }
  }
);

export const acceptFriendRequest = createAsyncThunk(
  "profile/acceptFriendRequest",
  async (userId, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/profiles/${userId}/accept-request`);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to accept request");
    }
  }
);

export const unfriendUser = createAsyncThunk(
  "profile/unfriendUser",
  async (userId, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/profiles/${userId}/unfriend`);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to unfriend");
    }
  }
);

export const blockUser = createAsyncThunk(
  "profile/blockUser",
  async (userId, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/profiles/${userId}/block`);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to block user");
    }
  }
);

export const fetchSuggestions = createAsyncThunk(
  "profile/fetchSuggestions",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/profiles/suggestions");
      return data.users;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to load suggestions");
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
        state.relationship = action.payload.relationship;
      })
      .addCase(fetchProfileByUsername.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(sendFriendRequest.fulfilled, (state) => {
        state.relationship = "request_sent";
      })
      .addCase(acceptFriendRequest.fulfilled, (state) => {
        state.relationship = "friends";
      })
      .addCase(unfriendUser.fulfilled, (state) => {
        state.relationship = "none";
      })
      .addCase(blockUser.fulfilled, (state) => {
        state.relationship = "blocked";
      })
      .addCase(fetchSuggestions.fulfilled, (state, action) => {
        state.suggestions = action.payload;
      })
      .addCase(updateMyProfile.fulfilled, (state, action) => {
        state.profileUser = action.payload;
      });
  },
});

export default profileSlice.reducer;
