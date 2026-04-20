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
      });
  },
});

export const { setActiveConversation } = messagesSlice.actions;
export default messagesSlice.reducer;
