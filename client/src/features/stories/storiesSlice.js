/**
 * @file storiesSlice.js
 * @description إدارة الستوريز في الـ Frontend مع معالجة الأخطاء.
 */

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../services/api";

const initialState = {
  stories: [],
  status: "idle",
  error: null,
};

export const fetchStories = createAsyncThunk(
  "stories/fetchStories", 
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/stories");
      return data.stories || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to load stories");
    }
  }
);

export const createStory = createAsyncThunk(
  "stories/createStory",
  async ({ mediaUrl, mediaType }, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/stories", { mediaUrl, mediaType });
      return data.story;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to create story");
    }
  }
);

export const viewStory = createAsyncThunk(
  "stories/viewStory", 
  async (storyId, { rejectWithValue }) => {
    try {
      await api.post(`/stories/${storyId}/view`);
      return storyId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to mark story as viewed");
    }
  }
);

const storiesSlice = createSlice({
  name: "stories",
  initialState,
  reducers: {
    clearStoriesError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStories.fulfilled, (state, action) => {
        state.stories = action.payload;
        state.status = "succeeded";
      })
      .addCase(createStory.fulfilled, (state, action) => {
        if (action.payload) {
          state.stories.unshift(action.payload);
        }
      })
      .addMatcher(
        (action) => action.type.endsWith("/rejected"),
        (state, action) => {
          state.status = "failed";
          state.error = action.payload;
        }
      );
  },
});

export const { clearStoriesError } = storiesSlice.actions;
export default storiesSlice.reducer;
