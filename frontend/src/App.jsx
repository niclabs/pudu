/** * App 
 * @description Main application component that sets up routing for the Pudu frontend.
 *
 * This file defines the routes for the application, 
 * including both public and protected routes
 * The navbar is included at the top of the structure, 
 * and the main content area is defined to display the appropriate view based on the route.
 * 
 * @requires utils/protectedroute.jsx     guards certain routes based on authentication
 * @requires components/custom/navbar.jsx   the navigation bar component displayed on all pages
 * @component
 * @returns {JSX.Element} 
 */

import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import TagView from "./pages/tag_management/TagView";
import Navbar from "./components/custom/navbar";
import StudyView from "./pages/study_search/StudyView";
import EditStudyView from "./pages/edit_study/EditStudyView";
import SysRevView from "./pages/reviews/SysRevView";
import LoginView from "./pages/login/LoginView";
import RegisterView from "./pages/login/RegisterView";
import ProtectedRoute from "./utils/protectedroute.jsx";
import PasswordResetRequest from "./pages/login/PasswordResetViewRequest";
import PasswordReset from "./pages/login/PasswordReset-View";
import DashboardView from "./pages/dashboard/DashboardView";

export default function App() {
  return (
    <Router>
      <title>pudu</title>
      <div className="flex flex-col h-full">
        <Navbar />
        <main className="flex-grow overflow-hidden">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LoginView />} />
            <Route path="/register" element={<RegisterView />} />
            <Route path="/request/password_reset" element={<PasswordResetRequest />} />
            <Route path="/password-reset/:token" element={<PasswordReset />} />


            {/* Protected Routes */}
            <Route
              path="/sysrev"
              element={
                <ProtectedRoute>
                  <SysRevView />
                </ProtectedRoute>
              }
            />

            <Route
              path="/tags"
              element={
                <ProtectedRoute>
                  <TagView />
                </ProtectedRoute>
              }
            />

            
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardView/>
                </ProtectedRoute>
              }
            />
            

            <Route
              path="/studies"
              element={
                <ProtectedRoute>
                  <StudyView />
                </ProtectedRoute>
              }
            />

            <Route
              path="/editstudy"
              element={
                <ProtectedRoute>
                  <EditStudyView />
                </ProtectedRoute>
              }
            />

            <Route
              path="/editstudy/:studyid"
              element={
                <ProtectedRoute>
                  <EditStudyView />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
