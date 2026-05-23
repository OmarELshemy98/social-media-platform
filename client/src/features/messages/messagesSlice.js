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
  error: null,
};

/**
 * وظيفة (Thunk) لجلب كل المحادثات من السيرفر.
 */
export const fetchConversations = createAsyncThunk(
  "messages/fetchConversations", 
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/messages/conversations");
      return data.conversations || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch conversations");
    }
  }
);

/**
 * وظيفة لجلب رسايل محادثة معينة.
 */
export const fetchConversationMessages = createAsyncThunk(
  "messages/fetchConversationMessages",
  async (conversationId, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/messages/conversations/${conversationId}/messages`);
      return { conversationId, messages: data.messages || [] };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch messages");
    }
  }
);

/**
 * وظيفة إرسال رسالة جديدة.
 */
export const sendMessage = createAsyncThunk(
  "messages/sendMessage",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/messages", payload);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to send message");
    }
  }
);

export const updateMessage = createAsyncThunk(
  "messages/updateMessage",
  async ({ messageId, content }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/messages/${messageId}`, { content });
      return data.message;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update message");
    }
  }
);

export const deleteMessage = createAsyncThunk(
  "messages/deleteMessage",
  async (messageId, { rejectWithValue }) => {
    try {
      await api.delete(`/messages/${messageId}`);
      return messageId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete message");
    }
  }
);

/**
 * وظيفة بدء محادثة جديدة مع يوزر عن طريق الـ username بتاعه.
 */
export const startConversationWithUser = createAsyncThunk(
  "messages/startConversation",
  async (username, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/messages/conversations/start", { username });
      return data.conversation;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to start conversation");
    }
  }
);

/**
 * وظيفة لتحديد الرسايل كـ "مقروءة" (Seen).
 */
export const markMessagesAsRead = createAsyncThunk(
  "messages/markMessagesAsRead",
  async (conversationId, { rejectWithValue }) => {
    try {
      await api.put(`/messages/conversations/${conversationId}/read`);
      return { conversationId };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to mark as read");
    }
  }
);

/**
 * وظيفة تحديث إعدادات المحادثة (Archive, Mute, Pin, Delete)
 */
export const updateConversationSettings = createAsyncThunk(
  "messages/updateSettings",
  async ({ conversationId, action }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/messages/conversations/${conversationId}/settings`, { action });
      return { conversationId, action, conversation: data.conversation };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update settings");
    }
  }
);

/**
 * وظيفة حظر الرسايل فقط
 */
export const toggleMessageBlock = createAsyncThunk(
  "messages/toggleBlock",
  async (conversationId, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/messages/conversations/${conversationId}/toggle-block`);
      return { conversationId, conversation: data.conversation };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to toggle block");
    }
  }
);

const messagesSlice = createSlice({
  name: "messages",
  initialState,
  reducers: {
    setActiveConversation: (state, action) => {
      state.activeConversationId = action.payload;
    },
    clearMessagesError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.conversations = action.payload;
        state.status = "succeeded";
      })
      .addCase(fetchConversationMessages.fulfilled, (state, action) => {
        state.activeConversationId = action.payload.conversationId;
        state.messages = action.payload.messages;
        state.status = "succeeded";
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        if (action.payload?.message) {
          state.messages.push(action.payload.message);
        }
      })
      .addCase(updateMessage.fulfilled, (state, action) => {
        const index = state.messages.findIndex(m => m._id === action.payload._id);
        if (index !== -1) {
          state.messages[index] = action.payload;
        }
      })
      .addCase(deleteMessage.fulfilled, (state, action) => {
        state.messages = state.messages.filter(m => m._id !== action.payload);
      })
      .addCase(startConversationWithUser.fulfilled, (state, action) => {
        if (action.payload?._id) {
          const index = state.conversations.findIndex(c => c._id === action.payload._id);
          if (index === -1) {
            state.conversations.unshift(action.payload);
          }
          state.activeConversationId = action.payload._id;
        }
      })
      .addCase(updateConversationSettings.fulfilled, (state, action) => {
        const { conversationId, action: type, conversation } = action.payload;
        if (type === 'delete') {
          state.conversations = state.conversations.filter(c => c._id !== conversationId);
          if (state.activeConversationId === conversationId) {
            state.activeConversationId = null;
            state.messages = [];
          }
        } else {
          const index = state.conversations.findIndex(c => c._id === conversationId);
          if (index !== -1) {
            state.conversations[index] = conversation;
          }
        }
      })
      .addCase(toggleMessageBlock.fulfilled, (state, action) => {
        const { conversationId, conversation } = action.payload;
        const index = state.conversations.findIndex(c => c._id === conversationId);
        if (index !== -1) {
          state.conversations[index] = conversation;
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

export const { setActiveConversation, clearMessagesError } = messagesSlice.actions;
export default messagesSlice.reducer;
