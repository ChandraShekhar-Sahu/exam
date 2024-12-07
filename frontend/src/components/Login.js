import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, updateDoc, collection, getDocs } from "firebase/firestore";
import React, { useState } from "react";
import { auth, db } from "./firebase";
import { ToastContainer, toast } from "react-toastify";
import SignInwithGoogle from "./signInWithGoogle";
import { v4 as uuidv4 } from "uuid";
import "react-toastify/dist/ReactToastify.css"; // Import CSS for react-toastify

function Login() {
  const [email, setEmail] = useState(""); // For studentId or email
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("Student"); // Default selected user type
  const [loading, setLoading] = useState(false); // State to manage loading

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Start loading
    
    try {
      if (userType === "Student") {
        const studentsRef = collection(db, "Users", "b2OcTcWAkubNYoyEBr2ZHuiOxCc2", "Students");
        const studentsSnapshot = await getDocs(studentsRef);
        
        let matchFound = false;
        for (const studentDoc of studentsSnapshot.docs) {
          const studentData = studentDoc.data();
          
          // Check if rollNumber and password match
          if (studentData.rollNumber === email && studentData.password === password) {
            matchFound = true;
            console.log("Match found in document (student ID):", studentDoc.id);
            localStorage.setItem("studentId", studentDoc.id);
            localStorage.setItem("studentroll", studentData.rollNumber);
            localStorage.setItem("studentname", studentData.name);

            const sessionKey = uuidv4();
            await updateDoc(doc(db, "Users", "b2OcTcWAkubNYoyEBr2ZHuiOxCc2", "Students", studentDoc.id), {
              sessionKey,
            });

            localStorage.setItem("sessionKey", sessionKey); // Store session key

            toast.success("Student logged in successfully", {
              position: "top-center",
            });
            window.location.href = "/myreport"; // Redirect to student report
            break;
          }
        }

        if (!matchFound) {
          throw new Error("Invalid roll number or password.");
        }
      } else if (userType === "College") {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const userId = userCredential.user.uid;

        const userDocRef = doc(db, "Users", userId);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (!userData.isCollege) {
            throw new Error("No college exists for this user.");
          }

          const sessionKey = uuidv4();
          await updateDoc(userDocRef, { sessionKey });
          localStorage.setItem("sessionKey", sessionKey);

          toast.success("College logged in successfully", { position: "top-center" });
          window.location.href = "/profile"; // Redirect to college profile
        } else {
          throw new Error("No user document found.");
        }
      }
    } catch (error) {
      console.error("Login Error:", error.message);
      toast.error(`Login Error: ${error.message}`, {
        position: "top-center",
      });
    } finally {
      setLoading(false); // End loading
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-6 flex flex-col justify-center sm:py-12">
      <ToastContainer />
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-sky-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <h1 className="text-2xl font-semibold">Login</h1>

            {/* Toggle Buttons */}
            <div className="mb-4 flex justify-center gap-4">
              <button
                className={`px-4 py-2 rounded-md ${userType === "Student" ? "bg-sky-500 text-white" : "bg-gray-200"} hover:bg-sky-500 hover:text-white`}
                onClick={() => setUserType("Student")}
              >
                Student
              </button>
              <button
                className={`px-4 py-2 rounded-md ${userType === "College" ? "bg-sky-500 text-white" : "bg-gray-200"} hover:bg-sky-500 hover:text-white`}
                onClick={() => setUserType("College")}
              >
                College
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <input
                  type={userType === "Student" ? "text" : "email"} // Use text for student ID, email for college
                  placeholder={userType === "Student" ? "Student ID" : "Email"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                  required
                />
              </div>
              <div className="mb-4">
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-sky-500 text-white py-2 rounded-md hover:bg-sky-600 transition-colors"
                disabled={loading} // Disable button during loading
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>
            <div className="mt-4">
              <SignInwithGoogle />
            </div>
            <div className="flex flex-row">
      <p className="mr-2">If you Don't have an account Please  </p>
      <a href="/register" className="btn text-blue-800 text-center"> Register </a>
      <p className="ml-2"> Yourself.</p>
      </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
