/**
 * @file notificationsSlice.js
 * @description الفايل ده مسؤول عن "إدارة الإشعارات" في الـ Frontend.
 */

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
// استيراد الـ API اللي عملناه بـ Axios عشان نكلم السيرفر.
import api from "../../services/api";

// الحالة الابتدائية لمخزن الإشعارات.
const initialState = {
  notifications: [], // قائمة الإشعارات.
  unreadCount: 0, // عدد الإشعارات اللي لسه ماتقرأتش.
  status: "idle",
};

/**
 * وظيفة (Thunk) لجلب كل الإشعارات من السيرفر.
 */
export const fetchNotifications = createAsyncThunk("notifications/fetch", async () => {
  const { data } = await api.get("/notifications");
  return data;
});

/**
 * وظيفة لتعليم إشعار معين إنه اتقرأ.
 */
export const markNotificationRead = createAsyncThunk(
  "notifications/markRead",
  async (notificationId) => {
    // بنبعت طلب PATCH للسيرفر عشان يحدث حالة الإشعار.
    await api.patch(`/notifications/${notificationId}/read`);
    return notificationId;
  }
);

/**
 * وظيفة لتعليم "كل الإشعارات" إنها اتقرأت مرة واحدة.
 */
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
        // لما الإشعارات تيجي، بنحدث القائمة والعدد.
        state.notifications = action.payload.notifications;
        state.unreadCount = action.payload.unreadCount;
        state.status = "succeeded";
      })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        // بنحدث حالة الإشعار في الـ state فوراً بعد نجاح الطلب.
        const item = state.notifications.find((n) => n._id === action.payload);
        if (item && !item.isRead) {
          item.isRead = true;
          // بنقلل عدد الإشعارات غير المقروءة بمقدار 1.
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      .addCase(markAllNotificationsRead.fulfilled, (state) => {
        // بنعلم على كل اللي في القائمة كـ مقروء.
        state.notifications = state.notifications.map((item) => ({ ...item, isRead: true }));
        state.unreadCount = 0;
      });
  },
});

export default notificationsSlice.reducer;
