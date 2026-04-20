import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../services/api";

const initialState = {
  notifications: [],
  unreadCount: 0,
  status: "idle",
};

export const fetchNotifications = createAsyncThunk("notifications/fetch", async () => {
  const { data } = await api.get("/notifications");
  return data;
});

export const markNotificationRead = createAsyncThunk(
  "notifications/markRead",
  async (notificationId) => {
    await api.patch(`/notifications/${notificationId}/read`);
    return notificationId;
  }
);

export const markAllNotificationsRead = createAsyncThunk("notifications/markAllRead", async () => {
  await api.patch("/notifications/read-all");
});

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.notifications = action.payload.notifications;
        state.unreadCount = action.payload.unreadCount;
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
      });
  },
});

export default notificationsSlice.reducer;
