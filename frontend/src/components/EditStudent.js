import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage, auth } from './firebase';
import { toast } from 'react-toastify';
import Navbar from './navbar';
import LoadingDots from './LoadingDots';

const EditStudent = () => {
    const { studentId } = useParams();
    const navigate = useNavigate();
    const [studentData, setStudentData] = useState({
        name: "",
        rollNumber: "",
        fatherName: "",
        motherName: "",
        address: "", // Ensure this is correctly named in the state
        studentPhotoURL: "",
        password:"",
    });
    const [image, setImage] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [passwordVisible, setPasswordVisible] = useState(false); // State to control visibility
    
    useEffect(() => {
        toast.info("Fetching student data...");
        fetchStudentData();
    }, [studentId]);

    const fetchStudentData = async () => {
        try {
            const userId = auth.currentUser.uid;
            const studentDoc = doc(db, "Users", userId, "Students", studentId);
            const docSnap = await getDoc(studentDoc);
            if (docSnap.exists()) {
                setStudentData(docSnap.data());
        

                
            } else {
                toast.error("No such student!");
            }
        } catch (error) {
            console.error("Error fetching student data:", error);
            toast.error("Failed to fetch student data.");
        }
    };

    const saveStudentData = async () => {
        try {
            toast.info("Saving student data...");
            const userId = auth.currentUser.uid; 
            const updatedData = {
                ...studentData,
            };
            const studentDoc = doc(db, "Users", userId, "Students", studentId);
            await setDoc(studentDoc, updatedData, { merge: true });
            await handleImageUpload();
            toast.success("Student data updated successfully!");
            navigate('/profile');
        } catch (error) {
            console.error("Error saving student data:", error);
            toast.error("Failed to save student data.");
        }
    };

    const handleImageUpload = async () => {
        if (!image) return;

        const userId = auth.currentUser.uid; 
        const imageName = `${studentData.rollNumber}_${Date.now()}.jpg`;
        const storageRef = ref(storage, `studentImages/${userId}/${imageName}`);

        const uploadTask = uploadBytesResumable(storageRef, image);

        uploadTask.on(
            "state_changed",
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setUploadProgress(progress);
                console.log('Upload is ' + progress + '% done');
            },
            (error) => {
                console.error("Error uploading image:", error);
                toast.error("Image upload failed. Please try again.");
            },
            async () => {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                const studentDoc = doc(db, "Users", userId, "Students", studentId);
                await setDoc(studentDoc, { studentPhotoURL: downloadURL }, { merge: true });
                toast.success("Image uploaded successfully!");
                setUploadProgress(0); // Reset progress after upload
            }
        );
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setStudentData({
            ...studentData,
            [name]: value,
        });
    };

 

    const removePhoto = () => {
        setStudentData({
            ...studentData,
            studentPhotoURL: "",
        });
    };


        // Toggle visibility of the password
        const togglePasswordVisibility = () => {
            setPasswordVisible(!passwordVisible);
        };


    return (
        <div>
            <Navbar />
            <div className="max-w-md mx-auto pt-20 p-6 bg-white rounded-md shadow-md">
                <h2 className="text-2xl font-bold mb-4">Edit Student</h2>
                <form onSubmit={(e) => {
                    e.preventDefault();
                    saveStudentData();
                }}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700" htmlFor="name">Name</label>
                        <input
                            type="text"
                            name="name"
                            value={studentData.name}
                            onChange={handleChange}
                            placeholder="Name"
                            required
                            className="border border-gray-300 p-2 w-full rounded"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700" htmlFor="rollNumber">Roll Number</label>
                        <input
                            type="text"
                            name="rollNumber"
                            value={studentData.rollNumber}
                            onChange={handleChange}
                            placeholder="Roll Number"
                            required
                            className="border border-gray-300 p-2 w-full rounded"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700" htmlFor="fatherName">Father's Name</label>
                        <input
                            type="text"
                            name="fatherName"
                            value={studentData.fatherName}
                            onChange={handleChange}
                            placeholder="Father's Name"
                            className="border border-gray-300 p-2 w-full rounded"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700" htmlFor="motherName">Mother's Name</label>
                        <input
                            type="text"
                            name="motherName"
                            value={studentData.motherName}
                            onChange={handleChange}
                            placeholder="Mother's Name"
                            className="border border-gray-300 p-2 w-full rounded"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700" htmlFor="address">Address</label>
                        <input
                            type="text"
                            name="address" // Ensure this is correctly named
                            value={studentData.address}
                            onChange={handleChange}
                            placeholder="Student's Address"
                            className="border border-gray-300 p-2 w-full rounded"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700" htmlFor="password">Password</label>
                        <input
                            type={passwordVisible ? "text" : "password"}
                            name="password"
                            value={studentData.password}
                            onChange={handleChange}
                            placeholder="Password"
                            required
                            className="border border-gray-300 p-2 w-full rounded"
                            autoComplete="current-password"  // Add autocomplete attribute
                        />
                        <button
                            type="button"
                            onClick={togglePasswordVisibility}
                            className="absolute top-2 right-2 text-gray-500"
                        >
                            {passwordVisible ? "Hide" : "Show"}
                        </button>
                    </div>

                    {studentData.studentPhotoURL && (
                        <div className="mb-4">
                            <img src={studentData.studentPhotoURL} alt="Student" className="w-full h-48 object-cover mb-2 rounded" />
                            <button type="button" onClick={removePhoto} className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition duration-200">
                                Remove Photo
                            </button>
                        </div>
                    )}

                    <input
                        type="file"
                        onChange={(e) => setImage(e.target.files[0])}
                        className="mb-4"
                    />

                    {uploadProgress > 0 && (
                        // <div className="mb-4">
                        //     <div className="bg-gray-300 h-2 rounded">
                        //         <div
                        //             className="bg-blue-600 h-full rounded"
                        //             style={{ width: `${uploadProgress}%` }}
                        //         />
                        //     </div>
                        //     <span>{`Uploading... ${Math.round(uploadProgress)}%`}</span>
                        // </div>
                        <LoadingDots />
                    )}

                    <button type="submit" className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 transition duration-200">
                        Save
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EditStudent;
