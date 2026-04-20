import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import themeReducer from "../features/theme/themeSlice";
import postsReducer from "../features/posts/postsSlice";
import profileReducer from "../features/profile/profileSlice";
import notificationsReducer from "../features/notifications/notificationsSlice";
import searchReducer from "../features/search/searchSlice";
import messagesReducer from "../features/messages/messagesSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    theme: themeReducer,
    posts: postsReducer,
    profile: profileReducer,
    notifications: notificationsReducer,
    search: searchReducer,
    messages: messagesReducer,
  },
});
