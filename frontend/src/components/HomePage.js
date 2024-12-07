import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { auth } from "./firebase";
import Login from "./Login";
import Register from "./Register";
import Notify from "./Notifytoast";
import Profile from "./profile";
import MyCollege from "./MyCollege";
import LandingPage from "./LandingPage";
import ProtectedRoute from "./ProtectedRoute";
import EditStudent from "./EditStudent";
import AttendanceTable from "./AttendanceTable";
import CollegeList from "./CollegeList";
import MyReport from "./myReport";
import ChangePassword from "./changepassword";
import ExploreCollege from "./ExploreCollege";

import LoadingDots from "./LoadingDots";
import TakeAttendance from "./TakeAttendance";


export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsAuthenticated(!!user); // Set authenticated state based on user existence
      setLoading(false); // Set loading to false once the auth state is checked
    });

    return unsubscribe; // Cleanup listener on unmount
  }, []);

  if (loading) return <LoadingDots />; // Show loading until auth state is determined

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/colleges" element={<CollegeList />} />
        <Route path="/explore-college" element={<ExploreCollege />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify" element={<TakeAttendance />} />
        <Route path="/myreport" element={<MyReport />} />
        <Route path="/change_password" element={<ChangePassword />} />
        <Route path="/register" element={<Register />} />
        <Route path="/mycollege" element={<ProtectedRoute isAuthenticated={isAuthenticated}><MyCollege /></ProtectedRoute>} />
        {/* <Route path="/mar" element={<ProtectedRoute isAuthenticated={isAuthenticated}><StudentList /></ProtectedRoute>} /> */}
        <Route path="/attendance" element={<ProtectedRoute isAuthenticated={isAuthenticated}><AttendanceTable /></ProtectedRoute>} />
        <Route path="/editstudent/:studentId" element={<ProtectedRoute isAuthenticated={isAuthenticated}><EditStudent /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Profile /></ProtectedRoute>} />
        <Route path="/notify" element={<Notify />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}
