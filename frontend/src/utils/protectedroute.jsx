import { Navigate } from "react-router-dom";
import { AuthService } from "@/utils/authservice.jsx";

export default function ProtectedRoute({ children }) {
  const isAuthenticated = !!AuthService.getAccessToken();

  return isAuthenticated ? children : <Navigate to="/" replace />;
}