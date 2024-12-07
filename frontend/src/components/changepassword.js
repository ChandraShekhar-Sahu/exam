import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "./firebase"; // Assuming Firebase is initialized here
import { doc, getDoc, setDoc } from "firebase/firestore";
import { toast } from "react-toastify"; // Assuming you're using react-toastify for notifications

function ChangePassword() {
  const navigate = useNavigate();
  const [prevPassword, setPrevPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [studentId, setStudentId] = useState(null);

  useEffect(() => {
    // Get studentId from localStorage
    const storedStudentId = localStorage.getItem("studentId");
    
    // If studentId exists, let the user proceed; otherwise, show an error message or redirect
    if (storedStudentId) {
      setStudentId(storedStudentId);
    } else {
      // Redirect or show an error if no studentId exists
      toast.error("You are not authorized to change the password.");
      navigate("/login"); // Assuming "/login" is the login page
    }
  }, [navigate]);

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (!prevPassword || !newPassword) {
      toast.error("Please fill out both fields.");
      return;
    }

    setLoading(true);

    try {
      // Here, you can check against the existing password in your database or fire store.
      // Assuming you want to compare the existing password with the "prevPassword" entered by the user.

      const studentRef = doc(db, "Users", "b2OcTcWAkubNYoyEBr2ZHuiOxCc2", "Students", studentId);
      const studentSnap = await getDoc(studentRef);

      if (studentSnap.exists()) {
        const currentPassword = studentSnap.data().password;
    

        // If the entered previous password matches the stored password
        if (prevPassword === currentPassword) {
          // Update the password
          await setDoc(studentRef, { password: newPassword }, { merge: true });

          toast.success("Password successfully changed.");
          navigate("/myreport"); // Navigate to dashboard or other page
        } else {
          toast.error("The previous password is incorrect.");
        }
      } else {
        toast.error("Student record not found.");
      }
    } catch (error) {
      toast.error("Error changing password: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-center mb-4">Change Password</h2>

        {/* Wrap inputs in a form */}
        <form onSubmit={handlePasswordChange}>
          <div className="mb-4">
            <label htmlFor="prevPassword" className="block text-sm font-medium text-gray-700">Previous Password</label>
            <input
              type="password"
              id="prevPassword"
              value={prevPassword}
              onChange={(e) => setPrevPassword(e.target.value)}
              className="w-full mt-1 p-2 border border-gray-300 rounded-md"
              placeholder="Enter previous password"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">New Password</label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full mt-1 p-2 border border-gray-300 rounded-md"
              placeholder="Enter new password"
              required
            />
          </div>

          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={() => navigate("/myreport")}
              className="text-blue-500 hover:text-blue-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              disabled={loading}
            >
              {loading ? "Changing..." : "Change Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ChangePassword;
