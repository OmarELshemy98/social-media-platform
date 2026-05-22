/**
 * @file postsSlice.js
 * @description إدارة حالة المنشورات في الفرونت إند.
 */

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

export const toggleReaction = createAsyncThunk(
  "posts/toggleReaction",
  async ({ postId, type }, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/posts/${postId}/reaction`, { type });
      return data; // { postId, reactions, reactionsCount }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to react");
    }
  }
);

export const addCommentToPost = createAsyncThunk(
  "posts/addCommentToPost",
  async ({ postId, content }, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/posts/${postId}/comments`, { content });
      return { postId, post: data.post };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to comment");
    }
  }
);

export const updateComment = createAsyncThunk(
  "posts/updateComment",
  async ({ postId, commentId, content }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/posts/${postId}/comments/${commentId}`, { content });
      return { postId, post: data.post };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update comment");
    }
  }
);

export const deleteComment = createAsyncThunk(
  "posts/deleteComment",
  async ({ postId, commentId }, { rejectWithValue }) => {
    try {
      const { data } = await api.delete(`/posts/${postId}/comments/${commentId}`);
      return { postId, post: data.post };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete comment");
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

export const sharePost = createAsyncThunk(
  "posts/sharePost",
  async ({ postId, content }, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/posts/${postId}/share`, { content });
      return data.post;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to share post");
    }
  }
);

const postsSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {
    optimisticReaction: (state, action) => {
      const { postId, userId, type } = action.payload;
      const post = state.posts.find((p) => p._id === postId);
      if (!post) return;
      
      if (!post.reactions) post.reactions = [];
      const index = post.reactions.findIndex(r => String(r.user) === String(userId));
      
      if (index !== -1) {
        if (post.reactions[index].type === type) {
          post.reactions.splice(index, 1);
        } else {
          post.reactions[index].type = type;
        }
      } else {
        post.reactions.push({ user: userId, type });
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFeedPosts.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.posts = action.payload.posts;
        state.pagination = action.payload.pagination;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.posts.unshift(action.payload);
      })
      .addCase(toggleReaction.fulfilled, (state, action) => {
        const post = state.posts.find(p => p._id === action.payload.postId);
        if (post) {
          post.reactions = action.payload.reactions;
        }
      })
      .addCase(addCommentToPost.fulfilled, (state, action) => {
        const index = state.posts.findIndex(p => p._id === action.payload.postId);
        if (index !== -1) state.posts[index] = action.payload.post;
      })
      .addCase(updateComment.fulfilled, (state, action) => {
        const index = state.posts.findIndex(p => p._id === action.payload.postId);
        if (index !== -1) state.posts[index] = action.payload.post;
      })
      .addCase(deleteComment.fulfilled, (state, action) => {
        const index = state.posts.findIndex(p => p._id === action.payload.postId);
        if (index !== -1) state.posts[index] = action.payload.post;
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        state.posts = state.posts.filter(p => p._id !== action.payload);
      })
      .addCase(sharePost.fulfilled, (state, action) => {
        state.posts.unshift(action.payload);
      });
  },
});

export const { optimisticReaction } = postsSlice.actions;
export default postsSlice.reducer;
