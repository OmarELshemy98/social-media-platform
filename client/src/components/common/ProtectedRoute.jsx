/**
 * @file ProtectedRoute.jsx
 * @description الفايل ده هو "البواب" بتاع الصفحات الخاصة.
 * وظيفته إنه يتأكد إن اليوزر مسجل دخول (Authenticated) قبل ما يخليه يدخل على أي صفحة محتاجة حساب.
 * لو اليوزر مسجل، بيدخله عادي (Outlet)، لو مش مسجل، بيطرده ويوديه لصفحة الـ Login.
 */

import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
