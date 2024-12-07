import React, { useEffect, useState } from "react";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { auth, db } from "./firebase"; // Your Firebase config
import { toast } from "react-toastify";
import { setDoc, doc, getDoc } from "firebase/firestore";
import googleLogo from "../../static/images/google.jpg";

// Import the gapi-script module
import { gapi } from "gapi-script";

function SignInwithGoogle() {
  const [isGapiLoaded, setIsGapiLoaded] = useState(false);

  // Initialize gapi when component mounts
  useEffect(() => {
    const loadGAPI = () => {
      if (typeof window !== "undefined" && window.gapi) {
        gapi.load("auth2", () => {
          const auth2 = gapi.auth2.init({
            client_id: "894282890418-qhe6jc5ab6mhvjgj7apfd492qesj8rkk.apps.googleusercontent.com",
            scope: "profile email",
          });

          auth2.then(() => {
            setIsGapiLoaded(true);  // Mark GAPI as loaded
          }).catch((error) => {
            console.error("GAPI Initialization Error:", error);
          });
        });
      } else {
        console.error("GAPI is not available.");
      }
    };

    loadGAPI();
  }, []);

  const googleLogin = async () => {
    if (!isGapiLoaded) {
      toast.error("Google API not loaded. Please try again.");
      return;
    }
  
    try {
      const auth2 = gapi.auth2.getAuthInstance();
      const googleUser = await auth2.signIn();
      const idToken = googleUser.getAuthResponse().id_token;
  
      // Log user details to the console
      const profile = googleUser.getBasicProfile();
      console.log("User ID:", profile.getId());
      console.log("Full Name:", profile.getName());
      console.log("Email:", profile.getEmail());
      console.log("Photo URL:", profile.getImageUrl());
  
      // Sign in to Firebase with the Google ID token
      const credential = GoogleAuthProvider.credential(idToken);
      const result = await signInWithCredential(auth, credential);
      const user = result.user;
  
      // Reference to the user's document in Firestore
      const userDocRef = doc(db, "Users", user.uid);
      const userDoc = await getDoc(userDocRef);
  
      if (userDoc.exists()) {
        // If user document exists, log in the user
        toast.success("User logged in successfully", { position: "top-center" });
        window.location.href = "/profile";
      } else {
        // If user document does not exist, create it with default information
        await setDoc(userDocRef, {
          email: user.email,
          firstName: user.displayName,
          photo: user.photoURL,
          lastName: "", // Placeholder for last name, if required later
          phoneNumber: user.phoneNumber || "", // Store phone number if available
          address: "", // Placeholder for address, can be updated later
          createdAt: new Date(), // Track account creation time
        });
  
        // Notify the user that the account was created
        toast.success("Account created successfully. Please log in again.", {
          position: "top-center",
        });
        window.location.href = "/login";
      }
    } catch (error) {
      // Handle errors in the login process
      console.error("Login failed:", error.message);
      toast.error("Authentication failed: " + error.message, { position: "top-center" });
    }
  };
  

  return (
    <div>
      <div className="items-center">
        <p className="continue-p text-center pb-5">--Or continue with--</p>
      </div>
      <div
        style={{ display: "flex", justifyContent: "center", cursor: "pointer" }}
        onClick={googleLogin}
      >
        <img src={googleLogo} alt="Google Sign-In" width="60%" />
      </div>

    </div>
  );
}

export default SignInwithGoogle;
