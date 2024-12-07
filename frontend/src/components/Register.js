import { createUserWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import { auth, db } from "./firebase";
import { setDoc, doc } from "firebase/firestore";
import { toast } from "react-toastify";
import { v4 as uuidv4 } from "uuid";
import SignInwithGoogle from "./signInWithGoogle";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [role, setRole] = useState("Student"); // Default role is Student

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!role) {
      toast.error("Please select a role: Student or College", {
        position: "top-center",
      });
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Generate a unique session key
      const sessionKey = uuidv4();

      // Store user data along with session key
      await setDoc(doc(db, "Users", user.uid), {
        email: user.email,
        firstName: fname,
        lastName: lname,
        isStudent: role === "Student",
        isCollege: role === "College",
        sessionKey: sessionKey,
      });

      // Store session key in localStorage
      localStorage.setItem("sessionKey", sessionKey);

      toast.success("User Registered Successfully!!", {
        position: "top-center",
      });
      window.location.href = "/profile";
    } catch (error) {
      console.error("Registration Error:", error.message);
      toast.error(error.message, {
        position: "bottom-center",
      });
    }
  };

  return (
    <form onSubmit={handleRegister}>
      <div className="min-h-screen bg-gray-100 py-6 flex justify-center items-center">
        <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
          <h1 className="text-2xl font-semibold text-center">Sign Up</h1>
          <div className="divide-y divide-gray-200 space-y-4 mt-6">
            <div className="space-y-4">
              <div className="flex justify-between">
                <p className="text-sm text-gray-600">Select your role:</p>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    className={`px-3 py-1 rounded-md text-sm ${role === "Student" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
                    onClick={() => setRole("Student")}
                  >
                    Student
                  </button>
                  <button
                    type="button"
                    className={`px-3 py-1 rounded-md text-sm ${role === "College" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
                    onClick={() => setRole("College")}
                  >
                    College
                  </button>
                </div>
              </div>

              <InputField
                label="First Name"
                id="fname"
                type="text"
                value={fname}
                onChange={(e) => setFname(e.target.value)}
              />
              <InputField
                label="Last Name"
                id="lname"
                type="text"
                value={lname}
                onChange={(e) => setLname(e.target.value)}
              />
              <InputField
                label="Email Address"
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <InputField
                label="Password"
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="mt-6">
              <button
                type="submit"
                className="bg-cyan-500 text-white rounded-md px-4 py-2 w-full"
              >
                Sign Up
              </button>
            </div>

            <p className="text-sm text-center mt-4">
              Already registered?{" "}
              <a href="/login" className="text-blue-500">Login</a>
            </p>

            <div className="mt-6">
              <SignInwithGoogle />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}

function InputField({ label, id, type, value, onChange }) {
  return (
    <div className="relative">
      <input
        type={type}
        id={id}
        value={value}
        autoComplete="off"
        className="peer placeholder-transparent h-10 w-full border-b-2 border-gray-300 text-gray-900 focus:outline-none focus:border-rose-600"
        placeholder={label}
        onChange={onChange}
        required
      />
      <label
        htmlFor={id}
        className="absolute left-0 -top-3.5 text-gray-600 text-sm peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-440 peer-placeholder-shown:top-2 transition-all peer-focus:-top-3.5 peer-focus:text-gray-600 peer-focus:text-sm"
      >
        {label}
      </label>
    </div>
  );
}

export default Register;
