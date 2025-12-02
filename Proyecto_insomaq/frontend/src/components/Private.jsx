import { Navigate } from "react-router-dom";

export default function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");

  // 🔹 Si no hay token, redirige al login
  return token ? children : <Navigate to="/" replace />;
}
