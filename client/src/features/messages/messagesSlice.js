/**
 * @file messagesSlice.js
 * @description الفايل ده مسؤول عن "إدارة الشات" في الـ Frontend باستخدام Redux Toolkit.
 */

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
// استيراد الـ API اللي عملناه بـ Axios عشان نكلم السيرفر.
import api from "../../services/api";

// الحالة الابتدائية لمخزن الرسائل.
const initialState = {
  conversations: [], // قائمة المحادثات اللي اليوزر مشترك فيها.
  messages: [], // الرسايل بتاعة المحادثة اللي مفتوحة دلوقتي.
  activeConversationId: null, // الـ ID بتاع المحادثة اللي اليوزر فاتحها دلوقتي.
  status: "idle", // حالة التحميل.
};

/**
 * وظيفة (Thunk) لجلب كل المحادثات من السيرفر.
 */
export const fetchConversations = createAsyncThunk("messages/fetchConversations", async () => {
  const { data } = await api.get("/messages/conversations");
  return data.conversations;
});

/**
 * وظيفة لجلب رسايل محادثة معينة.
 */
export const fetchConversationMessages = createAsyncThunk(
  "messages/fetchConversationMessages",
  async (conversationId) => {
    const { data } = await api.get(`/messages/conversations/${conversationId}/messages`);
    // بنرجع الـ ID والرسايل عشان الـ Redux يعرف يحدث أنهي محادثة.
    return { conversationId, messages: data.messages };
  }
);

/**
 * وظيفة إرسال رسالة جديدة.
 */
export const sendMessage = createAsyncThunk(
  "messages/sendMessage",
  async ({ receiverId, content }) => {
    const { data } = await api.post("/messages", { receiverId, content });
    return data;
  }
);

/**
 * وظيفة بدء محادثة جديدة مع يوزر عن طريق الـ username بتاعه.
 */
export const startConversationWithUser = createAsyncThunk(
  "messages/startConversation",
  async (username) => {
    const { data } = await api.post("/messages/conversations/start", { username });
    return data.conversation;
  }
);

const messagesSlice = createSlice({
  name: "messages",
  initialState,
  reducers: {
    // وظيفة عادية (Action) عشان نغير المحادثة النشطة يدوياً.
    setActiveConversation: (state, action) => {
      state.activeConversationId = action.payload;
    },
  },
  extraReducers: (builder) => {
    // هنا بنتعامل مع نتائج الـ AsyncThunks (العمليات اللي بتكلم السيرفر).
    builder
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.conversations = action.payload; // لما المحادثات تيجي، بنسيفها في الـ state.
      })
      .addCase(fetchConversationMessages.fulfilled, (state, action) => {
        state.activeConversationId = action.payload.conversationId;
        state.messages = action.payload.messages;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        // لما نبعت رسالة وتنجح، بنضيفها فوراً لقائمة الرسايل المعروضة.
        state.messages.push(action.payload.message);
      })
      .addCase(startConversationWithUser.fulfilled, (state, action) => {
        // لما نبدأ محادثة جديدة، بنشيك لو هي مش موجودة في القائمة، بنضيفها في الأول (unshift).
        const exists = state.conversations.find(c => c._id === action.payload._id);
        if (!exists) {
          state.conversations.unshift(action.payload);
        }
        state.activeConversationId = action.payload._id;
      });
  },
});

export const { setActiveConversation } = messagesSlice.actions;
export default messagesSlice.reducer;
