/**
 * @file themeSlice.js
 * @description الفايل ده مسؤول عن "شكل الموقع" (Dark/Light Mode).
 */

import { createSlice } from "@reduxjs/toolkit";

// بنجيب الثيم اللي اليوزر كان مختاره من الـ LocalStorage، ولو مفيش بنخلي الافتراضي "light".
const persistedMode = localStorage.getItem("themeMode") || "light";

// الحالة الابتدائية لمخزن الثيم.
const initialState = {
  mode: persistedMode,
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    // وظيفة لتغيير الثيم.
    toggleTheme: (state) => {
      // لو "light" بنخليه "dark" والعكس.
      state.mode = state.mode === "light" ? "dark" : "light";
      // بنحفظ الاختيار الجديد في الـ LocalStorage عشان يفضل ثابت.
      localStorage.setItem("themeMode", state.mode);
      // بنغير الـ attribute اللي في الـ HTML عشان الـ CSS يطبق الألوان الجديدة.
      document.documentElement.setAttribute("data-theme", state.mode);
    },
    // وظيفة لتهيئة الثيم أول ما الموقع يفتح.
    initTheme: (state) => {
      document.documentElement.setAttribute("data-theme", state.mode);
    },
  },
});

export const { toggleTheme, initTheme } = themeSlice.actions;
export default themeSlice.reducer;
