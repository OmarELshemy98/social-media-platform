/**
 * @file uploadService.js
 * @description الفايل ده مسؤول عن "إرسال الملفات" للسيرفر.
 * بياخد الصورة من اليوزر، يحطها في فورم (FormData)، ويبعتها للعنوان بتاع الـ upload في السيرفر، وبيرجع لنا رابط الصورة اللي اتسيفت.
 */

import api from "./api";

export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await api.post("/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.fileUrl;
};
