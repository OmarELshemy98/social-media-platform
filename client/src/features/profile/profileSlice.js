/**
 * @file profileSlice.js
 * @description الفايل ده مسؤول عن "بيانات البروفايل والعلاقات" في الـ Frontend.
 */

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
// استيراد الـ API اللي عملناه بـ Axios عشان نكلم السيرفر.
import api from "../../services/api";
// استيراد الأكشنز من postsSlice عشان نحدث بروفايل اليوزر لما يحصل تفاعل مع البوستات بتاعته.
import { 
  addCommentToPost, 
  deletePost, 
  toggleReaction
} from "../posts/postsSlice";

// الحالة الابتدائية لمخزن الملف الشخصي.
const initialState = {
  profileUser: null, // بيانات اليوزر صاحب البروفايل المعروض دلوقتي.
  profilePosts: [], // المنشورات بتاعة البروفايل ده.
  suggestions: [], // قائمة "ناس قد تعرفهم".
  relationship: "none", // حالة العلاقة (none, friends, request_sent, request_received, blocked).
  status: "idle",
  error: null,
};

/**
 * وظيفة (Thunk) لجلب بيانات ملف شخصي معين عن طريق الـ username.
 */
export const fetchProfileByUsername = createAsyncThunk(
  "profile/fetchByUsername",
  async (username, { rejectWithValue }) => {
    try {
      // بنبعت طلب GET للسيرفر على مسار /profiles/:username.
      const { data } = await api.get(`/profiles/${username}`);
      return data; // بنرجع بيانات اليوزر والبوستات والعلاقة.
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to load profile");
    }
  }
);

/**
 * وظيفة لإرسال طلب صداقة.
 */
export const sendFriendRequest = createAsyncThunk(
  "profile/sendFriendRequest",
  async (userId, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/profiles/${userId}/friend-request`);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to send request");
    }
  }
);

/**
 * وظيفة لقبول طلب صداقة.
 */
export const acceptFriendRequest = createAsyncThunk(
  "profile/acceptFriendRequest",
  async (userId, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/profiles/${userId}/accept-request`);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to accept request");
    }
  }
);

/**
 * وظيفة لإلغاء الصداقة.
 */
export const unfriendUser = createAsyncThunk(
  "profile/unfriendUser",
  async (userId, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/profiles/${userId}/unfriend`);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to unfriend");
    }
  }
);

/**
 * وظيفة لحظر مستخدم.
 */
export const blockUser = createAsyncThunk(
  "profile/blockUser",
  async (userId, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/profiles/${userId}/block`);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to block user");
    }
  }
);

/**
 * وظيفة لجلب اقتراحات الأصدقاء.
 */
export const fetchSuggestions = createAsyncThunk(
  "profile/fetchSuggestions",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/profiles/suggestions");
      return data.users;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to load suggestions");
    }
  }
);

/**
 * وظيفة لتحديث بيانات بروفايلي الشخصي.
 */
export const updateMyProfile = createAsyncThunk(
  "profile/updateMyProfile",
  async (payload, { rejectWithValue }) => {
    try {
      // بنبعت طلب PUT للسيرفر فيه البيانات الجديدة (اسم، بايو، صور).
      const { data } = await api.put("/profiles/me/update", payload);
      return data.user;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update profile");
    }
  }
);

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfileByUsername.pending, (state) => {
        state.status = "loading"; // حالة التحميل لما الطلب يبدأ.
        state.error = null;
      })
      .addCase(fetchProfileByUsername.fulfilled, (state, action) => {
        // لما بيانات البروفايل تيجي بنجاح.
        state.status = "succeeded";
        state.profileUser = action.payload.user;
        state.profilePosts = action.payload.posts;
        state.relationship = action.payload.relationship;
      })
      .addCase(fetchProfileByUsername.rejected, (state, action) => {
        // لو الطلب فشل.
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(sendFriendRequest.fulfilled, (state) => {
        // بنحدث حالة العلاقة فوراً لـ "طلب مرسل".
        state.relationship = "request_sent";
      })
      .addCase(acceptFriendRequest.fulfilled, (state) => {
        // بنحدث حالة العلاقة لـ "أصدقاء".
        state.relationship = "friends";
      })
      .addCase(unfriendUser.fulfilled, (state) => {
        // بنحدث حالة العلاقة لـ "لا يوجد".
        state.relationship = "none";
      })
      .addCase(blockUser.fulfilled, (state) => {
        // بنحدث حالة العلاقة لـ "محظور".
        state.relationship = "blocked";
      })
      .addCase(fetchSuggestions.fulfilled, (state, action) => {
        state.suggestions = action.payload;
      })
      .addCase(updateMyProfile.fulfilled, (state, action) => {
        // لما نحدث بياناتنا بنجاح، بنحدثها في الـ state.
        state.profileUser = action.payload;
      })
      .addCase(toggleReaction.fulfilled, (state, action) => {
        const post = state.profilePosts.find((item) => item._id === action.payload.postId);
        if (post) {
          post.reactions = action.payload.reactions;
        }
      })
      .addCase(addCommentToPost.fulfilled, (state, action) => {
        const post = state.profilePosts.find((item) => item._id === action.payload.postId);
        if (post) {
          post.comments = action.payload.post.comments;
        }
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        state.profilePosts = state.profilePosts.filter((item) => item._id !== action.payload);
      });
  },
});

export default profileSlice.reducer;
