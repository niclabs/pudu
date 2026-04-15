/** ProtectedRoute
 * @description Wrapper component that protects private routes (used in App.jsx).
 * It verifies if the current user is authenticated by checking the existence
 * of an access token. If the user is authenticated, loads the protected content.
 * If not, redirects to the login page.
 *
 * @component
 * @returns {JSX.Element} The protected page
 */

import { Navigate } from "react-router-dom";
import { AuthService } from "@/utils/authservice.jsx";

export default function ProtectedRoute({ children }) {
  const isAuthenticated = !!AuthService.getAccessToken();

  return isAuthenticated ? children : <Navigate to="/" replace />;
}