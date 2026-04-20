import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../services/api";

const initialState = {
  posts: [],
  pagination: null,
  status: "idle",
  error: null,
};

export const fetchFeedPosts = createAsyncThunk(
  "posts/fetchFeedPosts",
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/posts", { params });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to load feed");
    }
  }
);

export const createPost = createAsyncThunk(
  "posts/createPost",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/posts", payload);
      return data.post;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to create post");
    }
  }
);

export const toggleLikePost = createAsyncThunk(
  "posts/toggleLikePost",
  async (postId, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/posts/${postId}/like`);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to toggle like");
    }
  }
);

export const addCommentToPost = createAsyncThunk(
  "posts/addCommentToPost",
  async ({ postId, content }, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/posts/${postId}/comments`, { content });
      return { postId, comments: data.comments };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to comment");
    }
  }
);

export const deletePost = createAsyncThunk(
  "posts/deletePost",
  async (postId, { rejectWithValue }) => {
    try {
      await api.delete(`/posts/${postId}`);
      return postId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete post");
    }
  }
);

const postsSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {
    optimisticToggleLike: (state, action) => {
      const { postId, userId } = action.payload;
      const post = state.posts.find((item) => item._id === postId);
      if (!post) return;
      const exists = post.likes.some((id) => String(id) === String(userId));
      if (exists) {
        post.likes = post.likes.filter((id) => String(id) !== String(userId));
      } else {
        post.likes.push(userId);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFeedPosts.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchFeedPosts.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.posts = action.payload.posts;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchFeedPosts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.posts.unshift(action.payload);
      })
      .addCase(toggleLikePost.fulfilled, (state, action) => {
        const post = state.posts.find((item) => item._id === String(action.payload.postId));
        if (!post) return;
        // server is source of truth after optimistic update
      })
      .addCase(addCommentToPost.fulfilled, (state, action) => {
        const post = state.posts.find((item) => item._id === action.payload.postId);
        if (post) {
          post.comments = action.payload.comments;
        }
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        state.posts = state.posts.filter((item) => item._id !== action.payload);
      });
  },
});

export const { optimisticToggleLike } = postsSlice.actions;
export default postsSlice.reducer;
