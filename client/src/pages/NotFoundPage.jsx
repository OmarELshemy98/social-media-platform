/**
 * @file NotFoundPage.jsx
 * @description صفحة "الـ 404".
 * دي اللي بتظهر لليوزر لو دخل على لينك مش موجود في الموقع بتاعنا.
 */

import { Link } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <div className="text-center py-5">
      <h2>404 - Page Not Found</h2>
      <p className="text-muted">The page you are looking for does not exist.</p>
      <Link to="/">Return Home</Link>
    </div>
  );
};

export default NotFoundPage;
