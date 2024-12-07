import React, { useState } from "react";
import { auth, db } from './firebase'; // Firebase authentication and database access
import { useNavigate } from 'react-router-dom';
import LoadingBar from 'react-top-loading-bar'; // Loading bar component
import { getDoc, doc } from 'firebase/firestore'; // Import Firestore functions
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import WebcamCapture from './WebcamCapture'; // Import the webcam capture component
import { checkFaceMatch } from './api'; // Import the function to check face match via the API

function TakeAttendance() {
  return (
    <div>
      <TakeAttendanceComponent />
    </div>
  );
}

const TakeAttendanceComponent = () => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [photoURL, setPhotoURL] = useState(null); // URL of the user's photo
  const [capturedImage, setCapturedImage] = useState(null); // State to store captured image
  const navigate = useNavigate();

  // const fetchImageAsBase64 = async (url) => {
  //   try {
  //     const response = await fetch(url);
  //     const blob = await response.blob();
      
  //     return new Promise((resolve, reject) => {
  //       const reader = new FileReader();
  //       reader.onloadend = () => resolve(reader.result); 
  //       reader.onerror = () => reject(new Error('error'));
  //       reader.readAsDataURL(blob);  
  //     });
  //   } catch (error) {
  //     console.error('Error :', error);
  //     throw new Error('Failed to fetch and convert image');
  //   }
  // };
  
  
  const handleTakeAttendance = async () => {
    try {
      console.log("Starting attendance process...");
      setLoading(true);
      setProgress(10);
  
      const user = auth.currentUser;
      if (!user) {
        console.warn("No user is authenticated.");
        throw new Error("User not authenticated");
      }
  
      const userDocRef = doc(db, "Users", user.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setPhotoURL(userData.photoURL); // Set the photoURL here
      } else {
        throw new Error("User data not found");
      }
  
      setProgress(30);
  
      // Proceed only if capturedImage is set
      if (capturedImage) {
        const matchResult = await checkFaceMatch(capturedImage);
        setProgress(80);
  
        if (matchResult.match) {
          toast.success("Face matched! Navigating to attendance page...");
          navigate("/attendance");
        } else {
          toast.error("Face mismatch. You are not authorized.");
          navigate("/"); // Consider navigating to an error page or home
        }
      } else {
        toast.error("No captured image. Please take your photo first.");
      }
    } catch (error) {
      console.error("Error during authentication:", error);
      toast.error(`Error: ${error.message || "Something went wrong. Try again."}`);
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };
  

  return (
    <div>
      {loading && <LoadingBar color="#f11946" progress={progress} onLoaderFinished={() => setProgress(0)} />}
      
      {/* Display the fetched image */}
      {photoURL && <img src={photoURL} alt="User Photo" className="w-32 h-32 object-cover mb-4" />}
      
      <WebcamCapture setCapturedImage={setCapturedImage} />

      {/* Display captured image */}
      {capturedImage && (
        <div className="captured-image-container mt-4">
          <h4>Captured Image:</h4>
          <img src={capturedImage} alt="Captured" className="w-64 h-64 object-cover mt-2" />
        </div>
      )}
      
      <button 
        onClick={handleTakeAttendance} 
        className="bg-blue-500 text-white p-2 rounded mt-4"
      >
        Take Attendance
      </button>
    </div>
  );
};

export default TakeAttendance;
