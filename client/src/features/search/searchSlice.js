/**
 * @file searchSlice.js
 * @description الفايل ده مسؤول عن "إدارة البحث" في الـ Frontend.
 */

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
// استيراد الـ API اللي عملناه بـ Axios عشان نكلم السيرفر.
import api from "../../services/api";

// الحالة الابتدائية لمخزن البحث.
const initialState = {
  users: [], // نتائج البحث عن المستخدمين.
  posts: [], // نتائج البحث عن المنشورات.
  query: "", // كلمة البحث اللي اليوزر كتبها.
  status: "idle",
};

/**
 * وظيفة (Thunk) لتنفيذ البحث الشامل.
 */
export const runGlobalSearch = createAsyncThunk("search/run", async (query) => {
  // بنبعت طلب GET للسيرفر وبنبعت كلمة البحث كـ Parameter.
  const { data } = await api.get("/search", { params: { q: query } });
  // بنرجع النتائج ومعاها كلمة البحث.
  return { ...data, query };
});

const searchSlice = createSlice({
  name: "search",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(runGlobalSearch.pending, (state) => {
        state.status = "loading"; // حالة التحميل لما يبدأ البحث.
      })
      .addCase(runGlobalSearch.fulfilled, (state, action) => {
        // لما نتائج البحث تيجي بنجاح.
        state.status = "succeeded";
        state.users = action.payload.users;
        state.posts = action.payload.posts;
        state.query = action.payload.query;
      })
      .addCase(runGlobalSearch.rejected, (state) => {
        state.status = "failed"; // لو حصل غلط بنوقف التحميل.
      });
  },
});

export default searchSlice.reducer;
