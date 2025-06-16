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

export default function App() {
  return (
    <Router>
      <title>pudu</title>
      <div className="flex flex-col h-screen">
        <Navbar />
        <main className="flex-grow overflow-hidden">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LoginView />} />
            <Route path="/register" element={<RegisterView />} />

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
