import React, { useEffect, useState } from "react";
import { auth, db, storage } from "./firebase";
import { doc, getDoc, setDoc, collection, getDocs, addDoc, deleteDoc, updateDoc  } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytesResumable, deleteObject, uploadBytes } from "firebase/storage";
import { FaCamera, FaTrashAlt } from "react-icons/fa";
import Navbar from './navbar';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link } from 'react-router-dom';
import './profile.css';
import Footer from "./footer";


function Profile() {


  const [userDetails, setUserDetails] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [studentData, setStudentData] = useState({
    name: "",
    rollNumber: "",
    fatherName: "",
    motherName: "",
    studentPhotoURL: "",
  });
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    collegeName: "",
    section: "",
    branch: "",
    semester: "", // Added Semester
    photoURL: "",
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [students, setStudents] = useState([]);
  const [profileImage, setProfileImage] = useState(null);
  const [newStudent, setNewStudent] = useState({ rollNumber: "", name: "" });
  

  // Fetch user data from Firebase
  const fetchUserData = async () => {
    const user = auth.currentUser;
    if (user) {
      const docRef = doc(db, "Users", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setUserDetails(docSnap.data());
        setFormData(docSnap.data());
      } else {
        toast.error("User data does not exist");
      }
    } else {
      toast.error("User is not logged in");
    }
  };

// Fetch Students from Firestore
const fetchStudents = async () => {
  const userId = auth.currentUser.uid;
  const studentsCollection = collection(db, "Users", userId, "Students");
  const snapshot = await getDocs(studentsCollection);
  const studentsList = snapshot.docs
    .map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
    .sort((a, b) => a.rollNumber - b.rollNumber); // Sort by roll number in ascending order
  setStudents(studentsList);
};



  // Save or update user data in Firestore
  const saveUserData = async () => {
    const userId = auth.currentUser.uid;
    const docRef = doc(db, "Users", userId);
    await setDoc(docRef, formData, { merge: true });
    setEditMode(false);
    fetchUserData();
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const userId = auth.currentUser.uid;
    const storageRef = ref(storage, `profileImages/${userId}`);
    const uploadTask = uploadBytesResumable(storageRef, file);
    
    setIsUploading(true);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        toast.error("Upload error:", error);
        setIsUploading(false);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then(async (url) => {
          const userDocRef = doc(db, "Users", userId);
          await setDoc(userDocRef, { photoURL: url }, { merge: true });
          setFormData((prev) => ({ ...prev, photoURL: url }));
          fetchUserData();
          setIsUploading(false);
          setUploadProgress(0);
        });
      }
    );
  };

  const handlePhotoDelete = async () => {
    const userId = auth.currentUser.uid;
    const storageRef = ref(storage, `profileImages/${userId}`);
  
    deleteObject(storageRef)
      .then(async () => {
        const userDocRef = doc(db, "Users", userId);
        await setDoc(userDocRef, { photoURL: "" }, { merge: true });
        setFormData((prev) => ({ ...prev, photoURL: "" }));
        toast.success("Image deleted successfully");
      })
      .catch((error) => {
        console.error("Error deteting photo: ", error);
        toast.error("Failed to delete image.");
      });
  };

  useEffect(() => {
    fetchUserData();
    fetchStudents();
  }, []);

  // Handle form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Logout function
  const handleLogout = async () => {
    await auth.signOut();
    toast.info("Logged out successfully!");
    window.location.href = "/login";
  };


 

  // Remove student from the user's sub-collection in Firestore
  const removeStudent = async (studentId) => {
    try {
      const userId = auth.currentUser.uid;
      const studentDocRef = doc(db, "Users", userId, "Students", studentId);
      await deleteDoc(studentDocRef);
      fetchStudents();
      toast.success("Student removed successfully!");
    } catch (error) {
      console.error("Error removing student:", error);
      toast.error("Failed to remove student. Please try again.");
    }
  };

  const ProfileSection = () => (
    <div className="relative  w-full h-[60vh] bg-cover bg-center" style={{ backgroundImage: `url(${formData.bannerImageURL || '../../static/images/bg2.jpeg'})` }}>
    {isUploading && (
      <div className="progress-bar-container">
          <div className="progress-bar" style={{ width: `${uploadProgress}%` }}></div>
          <p className="progress-text">{Math.round(uploadProgress)}%</p>
        </div>
    )}
    <div>
      <div className="absolute top-10 left-10 flex items-start">
        <div className="relative w-40 h-40">
          {formData.photoURL ? (
            <img
              src={formData.photoURL}
              alt="Profile"
              className="w-full h-full rounded-full object-cover border-4 border-white shadow-lg"
            />
          ) : (
            <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500 text-4xl">👤</span>
            </div>
          )}
          <div className="absolute bottom-0 right-0 flex space-x-2">
            <label className="bg-blue-500 p-2 rounded-full text-white cursor-pointer hover:bg-blue-700">
              <FaCamera />
              <input type="file" onChange={handlePhotoUpload} className="hidden" />
            </label>
            {formData.photoURL && (
              <button
                onClick={handlePhotoDelete}
                className="bg-red-500 p-2 rounded-full text-white hover:bg-red-700"
              >
                <FaTrashAlt />
              </button>
            )}
          </div>
        </div>
      </div>


        {/* Profile Details */}
      <div className="absolute top-[5vh] left-[40vh] bg-white bg-opacity-80 rounded-lg shadow-lg p-6 w-1/2">
        <h2 className="text-3xl font-bold text-gray-800">
          {formData.firstName} {formData.lastName}
        </h2>
        <p className="text-gray-600 mb-4">{formData.email}</p>
      </div>
      {!editMode && (
        <div className="absolute top-1/2 left-[40vh] bg-white bg-opacity-80 rounded-lg shadow-lg p-6 w-1/2">
          <p className="text-gray-800 mb-2"><strong>College Name:</strong> {formData.collegeName}</p>
          <p className="text-gray-800 mb-2"><strong>Branch:</strong> {formData.branch}</p>
          <p className="text-gray-800 mb-2"><strong>Semester:</strong> {formData.semester}</p>
        </div>
      )}
    {editMode && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white bg-opacity-80 rounded-lg shadow-lg p-6 w-1/2">
      <label className="block text-gray-700 font-semibold mb-1">First Name</label>
      <input
        type="text"
        name="firstName"
        value={formData.firstName}
        onChange={handleChange}
        placeholder="First Name"
        className="border-b border-gray-300 focus:outline-none mb-1 w-full"
      />
      <label className="block text-gray-700 font-semibold mb-1">Last Name</label>
      <input
        type="text"
        name="lastName"
        value={formData.lastName}
        onChange={handleChange}
        placeholder="Last Name"
        className="border-b border-gray-300 focus:outline-none mb-1 w-full"
      />
      <label className="block text-gray-700 font-semibold mb-1">College Name</label>
      <input
        type="text"
        name="collegeName"
        value={formData.collegeName}
        onChange={handleChange}
        placeholder="College Name"
        className="border-b border-gray-300 focus:outline-none mb-4 w-full"
      />
      <label className="block text-gray-700 font-semibold mb-1">Branch</label>
      <input
        type="text"
        name="branch"
        value={formData.branch}
        onChange={handleChange}
        placeholder="Branch"
        className="border-b border-gray-300 focus:outline-none mb-4 w-full"
      />
      <label className="block text-gray-700 font-semibold mb-1">Semester</label>
      <input
        type="text"
        name="semester"
        value={formData.semester}
        onChange={handleChange}
        placeholder="Semester"
        className="border-b border-gray-300 focus:outline-none mb-4 w-full"
      />
      <button
        onClick={saveUserData}
        className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-700"
      >
        Save
      </button>
      <button
        onClick={() => setEditMode(false)}
        className="bg-green-400 text-white p-2 ml-4 rounded-lg hover:bg-green-700"
      >
        Cancel
      </button>
    </div>
  </div>
)}

      <button
        onClick={() => setEditMode(true)}
        className="absolute bottom-4 right-4 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-700"
      >
        {/* {editMode ? "Cancel" : "Edit Profile"} */}
        Edit Profile
      </button>
      {/* <button
        onClick={handleLogout}
        className="bg-red-500 text-white p-2 ml-2 rounded-lg hover:bg-red-700 mt-4"
      >
        Logout
      </button> */}
    </div>

    {/* Add Students Section */}
   {/* <StudentsDetail /> */}
  </div>

  );


const handleRollNumberChange = (e) => {
  const rollNumber = e.target.value;
  // Store in local cache
  localStorage.setItem('newStudentRollNumber', rollNumber);
};

const handleNameChange = (e) => {
  const name = e.target.value;
  // Store in local cache
  localStorage.setItem('newStudentName', name);
};

const addStudent = async () => {
  const rollNumber = localStorage.getItem('newStudentRollNumber');
  const name = localStorage.getItem('newStudentName');

  if (!rollNumber || !name) {
    toast.warn("Roll Number and Name are required");
    return;
  }

  // Check for unique roll number in current list
  if (students.some(student => student.rollNumber === rollNumber)) {
    toast.error("Roll Number must be unique");
    return;
  }

  try {
    const userId = auth.currentUser.uid;
    // Add new student to Firestore
    const studentRef = collection(db, "Users", userId, "Students");
    await addDoc(studentRef, { rollNumber, name });
    
    // Fetch updated student list
    fetchStudents();

    // Clear local cache after successful addition
    localStorage.removeItem('newStudentRollNumber');
    localStorage.removeItem('newStudentName');
    setNewStudent({ rollNumber: "", name: "" }); // Clear the state after adding
    toast.success("Student added successfully!");
  } catch (error) {
    console.error("Error adding student:", error);
    toast.error("Failed to add student. Please try again.");
  }
};

const StudentsDetail = () => {
  const [viewMode, setViewMode] = useState('showStudent'); // Initialize with 'showStudent' as the default view
  return (
    <div className="relative w-full h-[60vh] bg-cover bg-center mt-4" style={{ backgroundImage: `url(${formData.bannerImageURL || 'path/to/your/banner-image.jpg'})` }}>
    {/* Toggle Buttons */}
    <div className="flex justify-center space-x-2 mb-4">
      <button
        onClick={() => setViewMode('showStudent')}
        className={`w-full h-12 ${viewMode === 'showStudent' ? 'bg-gray-800 text-white' : 'bg-gray-300 text-gray-800'} rounded-lg`}
      >
        Show Student
      </button>
      <button
        onClick={() => setViewMode('addStudent')}
        className={`w-full h-12 ${viewMode === 'addStudent' ? 'bg-gray-800 text-white' : 'bg-gray-300 text-gray-800'} rounded-lg`}
      >
        Add Student
      </button>
    </div>
  
    {/* Conditionally Render Components */}
    {viewMode === 'showStudent' ? (
      <div className="bg-white shadow-lg items-center justify-start rounded-lg p-6 w-full sm:w-3/4 lg:w-1/2">
        <h2 className="text-3xl font-semibold mb-4">Student List</h2>
        <ul>
          {students.map((student) => (
            <li key={student.id} className="flex justify-between items-center mb-4 p-4 bg-gray-100 rounded-lg shadow-md hover:bg-gray-200 transition duration-200 ease-in-out">
              <span className="flex-1 text-gray-800 font-medium">
                {student.rollNumber} - {student.name}
              </span>
              <div className="flex space-x-2">
                <Link to={`/editStudent/${student.id}`}>
                  <button className="bg-yellow-500 text-white px-3 py-1 rounded-md hover:bg-yellow-600 transition duration-200">
                    Edit
                  </button>
                </Link>
                <button
                  onClick={() => removeStudent(student.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition duration-200"
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    ) : (
      <div className="bg-white shadow-lg rounded-lg p-6  w-full sm:w-3/4 lg:w-1/2">
        <h2 className="text-xl font-semibold mb-4">Manage Students</h2>
        <div className="space-y-4 mb-6">
          {/* Roll Number Input */}
          <div className="flex flex-col">
            <label className="text-gray-700 font-medium" htmlFor="rollNumber">
              Roll Number
            </label>
            <input
              id="rollNumber"
              type="text"
              placeholder="Enter Roll Number"
              className="border-b border-gray-300 focus:outline-none focus:border-blue-500 py-2 px-1 placeholder-gray-400"
              onChange={handleRollNumberChange}
            />
          </div>
  
          {/* Name Input */}
          <div className="flex flex-col">
            <label className="text-gray-700 font-medium" htmlFor="name">
              Name
            </label>
            <input
              id="name"
              type="text"
              placeholder="Enter Name"
              className="border-b border-gray-300 focus:outline-none focus:border-blue-500 py-2 px-1 placeholder-gray-400"
              onChange={handleNameChange}
            />
          </div>
  
          {/* Add Student Button */}
          <button
            onClick={addStudent}
            className="bg-blue-500 text-white w-full py-2 mt-4 rounded-lg hover:bg-blue-700 transition duration-200"
          >
            Add Student
          </button>
        </div>
      </div>
    )}

    <div>
      <Footer />
    </div>
  </div>
  
  );
};

  


  return (
    <div>
    <Navbar />
    <ToastContainer />
    <div className="pt-16">
    <ProfileSection />
    </div>
    <div><StudentsDetail /></div>
    
   
  </div>
  
  
  );
}

export default Profile;
