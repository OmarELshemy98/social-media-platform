import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../services/api";

const initialState = {
  conversations: [],
  messages: [],
  activeConversationId: null,
  status: "idle",
};

export const fetchConversations = createAsyncThunk("messages/fetchConversations", async () => {
  const { data } = await api.get("/messages/conversations");
  return data.conversations;
});

export const fetchConversationMessages = createAsyncThunk(
  "messages/fetchConversationMessages",
  async (conversationId) => {
    const { data } = await api.get(`/messages/conversations/${conversationId}/messages`);
    return { conversationId, messages: data.messages };
  }
);

export const sendMessage = createAsyncThunk(
  "messages/sendMessage",
  async ({ receiverId, content }) => {
    const { data } = await api.post("/messages", { receiverId, content });
    return data;
  }
);

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
    setActiveConversation: (state, action) => {
      state.activeConversationId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.conversations = action.payload;
      })
      .addCase(fetchConversationMessages.fulfilled, (state, action) => {
        state.activeConversationId = action.payload.conversationId;
        state.messages = action.payload.messages;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.messages.push(action.payload.message);
      })
      .addCase(startConversationWithUser.fulfilled, (state, action) => {
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
