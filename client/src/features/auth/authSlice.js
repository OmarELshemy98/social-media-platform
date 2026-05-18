/**
 * @file authSlice.js
 * @description الفايل ده مسؤول عن "حالة الحساب" (Auth State).
 * بنستخدم Redux Toolkit عشان ندير بيانات اليوزر المسجل في الموقع كله.
 */

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
// استيراد الـ API اللي عملناه بـ Axios عشان نكلم السيرفر.
import api from "../../services/api";

// بنجيب بيانات اليوزر والتوكن من الـ LocalStorage لو اليوزر كان فاتح الموقع قبل كده.
// الـ LocalStorage هي "ذاكرة المتصفح" اللي مش بتتمسح لما تقفل الصفحة.
const persistedToken = localStorage.getItem("token");
const persistedUser = localStorage.getItem("user");

// الحالة الابتدائية (Initial State) لمخزن المصادقة.
const initialState = {
  user: persistedUser ? JSON.parse(persistedUser) : null, // اليوزر لو متخزن بنحوله من JSON لكائن (Object).
  token: persistedToken || null, // التوكن.
  isAuthenticated: Boolean(persistedToken), // هل اليوزر مسجل دخول؟ (True لو في توكن).
  status: "idle", // حالة التحميل.
  error: null, // لو حصل غلط في التسجيل أو الدخول.
};

/**
 * وظيفة (Thunk) لتسجيل يوزر جديد.
 */
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (payload, { rejectWithValue }) => {
    try {
      // بنبعت بيانات اليوزر للسيرفر على مسار /auth/register.
      const { data } = await api.post("/auth/register", payload);
      return data; // بنرجع البيانات اللي جات من السيرفر.
    } catch (error) {
      // لو حصل غلط (مثلاً الإيميل موجود)، بنرجع رسالة الغلط اللي السيرفر بعتها.
      return rejectWithValue(
        error.response?.data?.errors || error.response?.data?.message || "Registration failed"
      );
    }
  }
);

/**
 * وظيفة (Thunk) لتسجيل الدخول.
 */
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (payload, { rejectWithValue }) => {
    try {
      // بنبعت الإيميل والباسورد للسيرفر.
      const { data } = await api.post("/auth/login", payload);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Login failed");
    }
  } 
);

/**
 * وظيفة غير متزامنة لجلب بيانات المستخدم الحالي بناءً على الرمز المخزن
 */
export const fetchCurrentUser = createAsyncThunk(
  "auth/fetchCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/auth/me");
      return data.user;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Session expired");
    }
  }
);

export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/auth/forgot-password", payload);
      return data; // نرجع الـ data كاملة (بما فيها الـ resetToken)
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to verify details");
    }
  }
);

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async ({ resetToken, password }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/auth/reset-password/${resetToken}`, { password });
      return data.message;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to reset password");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // تسجيل الخروج ومسح البيانات
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.status = "idle";
      state.error = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
    // مسح رسائل الخطأ
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // معالجة حالات التسجيل
      .addCase(registerUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        localStorage.setItem("token", action.payload.token);
        localStorage.setItem("user", JSON.stringify(action.payload.user));
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // معالجة حالات تسجيل الدخول
      .addCase(loginUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        localStorage.setItem("token", action.payload.token);
        localStorage.setItem("user", JSON.stringify(action.payload.user));
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        localStorage.setItem("user", JSON.stringify(action.payload));
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      });
  },
});

export const { logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
