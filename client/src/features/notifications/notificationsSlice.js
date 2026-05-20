/**
 * @file notificationsSlice.js
 * @description إدارة الإشعارات مع معالجة الأخطاء.
 */

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../services/api";

const initialState = {
  notifications: [],
  unreadCount: 0,
  status: "idle",
  error: null,
};

export const fetchNotifications = createAsyncThunk(
  "notifications/fetch", 
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/notifications");
      return data || { notifications: [], unreadCount: 0 };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to load notifications");
    }
  }
);

export const markNotificationRead = createAsyncThunk(
  "notifications/markRead",
  async (notificationId, { rejectWithValue }) => {
    try {
      await api.patch(`/notifications/${notificationId}/read`);
      return notificationId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to mark notification as read");
    }
  }
);

export const markAllNotificationsRead = createAsyncThunk(
  "notifications/markAllRead", 
  async (_, { rejectWithValue }) => {
    try {
      await api.patch("/notifications/read-all");
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to mark all as read");
    }
  }
);

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    clearNotificationsError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.notifications = action.payload.notifications || [];
        state.unreadCount = action.payload.unreadCount || 0;
        state.status = "succeeded";
      })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const item = state.notifications.find((n) => n._id === action.payload);
        if (item && !item.isRead) {
          item.isRead = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      .addCase(markAllNotificationsRead.fulfilled, (state) => {
        state.notifications = state.notifications.map((item) => ({ ...item, isRead: true }));
        state.unreadCount = 0;
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

export const { clearNotificationsError } = notificationsSlice.actions;
export default notificationsSlice.reducer;
