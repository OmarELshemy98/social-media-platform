import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { RouterProvider } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";
import { store } from "./app/store";
import router from "./app/router";
import { initializeTheme } from "./features/theme/themeSlice";
import { fetchCurrentUser } from "./features/auth/authSlice";

store.dispatch(initializeTheme());
if (localStorage.getItem("token")) {
  store.dispatch(fetchCurrentUser());
}
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>,
)
