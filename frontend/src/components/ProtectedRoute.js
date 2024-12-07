import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import { useNavigate } from "react-router-dom";
import React from "react";
import LoadingDots from "./LoadingDots";

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); // Add loading state
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      setLoading(true);
      const user = auth.currentUser;
      console.log("Checking session for user:", user);

      if (user) {
        const userDocRef = doc(db, "Users", user.uid);
        const userDoc = await getDoc(userDocRef);

        const sessionKey = localStorage.getItem("sessionKey");
        console.log("Stored session key:", sessionKey);

        if (userDoc.exists()) {
          const userSessionKey = userDoc.data().sessionKey;
          console.log("User session key in Firestore:", userSessionKey);

          if (userSessionKey === sessionKey) {
            setIsAuthenticated(true);
            setLoading(false);
          } else {
            console.error("Session key mismatch");
            navigate("/login");
          }
        } else {
          console.error("User document does not exist in Firestore");
          navigate("/login");
        }
      } else {
        console.error("No user is currently authenticated");
        navigate("/login");
      }
      setLoading(false);
    };

    checkSession();
  }, [navigate]);

  // Show loading indicator until loading is complete
  if (loading) return <LoadingDots />;

  // Render children if authenticated, otherwise null (in case navigate fails)
  return isAuthenticated ? children : null;
};

export default ProtectedRoute;
