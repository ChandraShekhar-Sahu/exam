import React, { useState } from 'react';
import { storage } from './firebase';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const CollegeList = () => {
    const [collegeData, setCollegeData] = useState({
        Name: "",
        Location: "",
        Description: "",
        EstablishmentDate: "",
        HighestPackage: "",
        logoURL: "",
        CollegePhotoUrl: "",
        CollegeURL: "",
    });

    const [logoFile, setLogoFile] = useState(null);
    const [photoFile, setPhotoFile] = useState(null);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setCollegeData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleFileChange = (event) => {
        const { name, files } = event.target;
        if (name === 'logoURL') {
            setLogoFile(files[0]);
        } else if (name === 'CollegePhotoUrl') {
            setPhotoFile(files[0]);
        }
    };

    const uploadFile = async (file) => {
        const fileRef = ref(storage, `colleges/${file.name}`);
        await uploadBytes(fileRef, file);
        return await getDownloadURL(fileRef);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            const logoURL = logoFile ? await uploadFile(logoFile) : "";
            const CollegePhotoUrl = photoFile ? await uploadFile(photoFile) : "";

            const yourData = {
                ...collegeData,
                logoURL,
                CollegePhotoUrl,
            };

            const response = await fetch('https://collegemngmnt-default-rtdb.firebaseio.com/colleges.json', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(yourData),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            console.log("Data saved:", data);

            setCollegeData({
                Name: "",
                Location: "",
                Description: "",
                EstablishmentDate: "",
                HighestPackage: "",
                logoURL: "",
                CollegePhotoUrl: "",
                CollegeURL: "",
            });
            setLogoFile(null);
            setPhotoFile(null);
        } catch (error) {
            console.error('Error submitting data:', error);
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen flex items-center justify-center px-4">
            <form onSubmit={handleSubmit} className="max-w-sm w-full p-8 bg-white shadow-lg rounded-lg">
                <h2 className="text-2xl font-semibold text-center mb-6 text-gray-700">Add College Details</h2>
                
                {/* College Name with Icon */}
                <div className="mb-5">
                    <label htmlFor="Name" className="block mb-2 text-sm font-medium text-gray-900">College Name</label>
                    <div className="flex">
                        <span className="inline-flex items-center px-3 text-gray-900 bg-gray-200 border border-r-0 border-gray-300 rounded-l-md">
                            <svg className="w-4 h-4 text-gray-500" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 0a10 10 0 1 0 10 10A10.011 10.011 0 0 0 10 0Zm0 5a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm0 13a8.949 8.949 0 0 1-4.951-1.488A3.987 3.987 0 0 1 9 13h2a3.987 3.987 0 0 1 3.951 3.512A8.949 8.949 0 0 1 10 18Z"/>
                            </svg>
                        </span>
                        <input
                            type="text"
                            id="Name"
                            name="Name"
                            placeholder="College Name"
                            value={collegeData.Name}
                            onChange={handleChange}
                            className="rounded-none rounded-r-lg bg-gray-50 border border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500 flex-1 min-w-0 w-full text-sm p-2.5"
                        />
                    </div>
                </div>

                {/* Location Field with Icon */}
                <div className="mb-5">
                    <label htmlFor="Location" className="block mb-2 text-sm font-medium text-gray-900">Location</label>
                    <div className="flex">
                        <span className="inline-flex items-center px-3 text-gray-900 bg-gray-200 border border-r-0 border-gray-300 rounded-l-md">
                            <svg className="w-4 h-4 text-gray-500" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 2a6 6 0 0 0-6 6c0 3.15 2.577 6.8 5.292 9.236.4.36 1.016.36 1.415 0C13.423 14.8 16 11.15 16 8a6 6 0 0 0-6-6Zm0 9a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z"/>
                            </svg>
                        </span>
                        <input
                            type="text"
                            id="Location"
                            name="Location"
                            placeholder="College Location"
                            value={collegeData.Location}
                            onChange={handleChange}
                            className="rounded-none rounded-r-lg bg-gray-50 border border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500 flex-1 min-w-0 w-full text-sm p-2.5"
                        />
                    </div>
                </div>

                {/* Description */}
                <div className="mb-5">
                    <label htmlFor="Description" className="block mb-2 text-sm font-medium text-gray-900">Description</label>
                    <textarea
                        id="Description"
                        name="Description"
                        placeholder="Description"
                        value={collegeData.Description}
                        onChange={handleChange}
                        className="w-full p-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                {/* Establishment Date Field with Icon */}
                <div className="mb-5">
                    <label htmlFor="EstablishmentDate" className="block mb-2 text-sm font-medium text-gray-900">Establishment Date</label>
                    <div className="flex">
                        <span className="inline-flex items-center px-3 text-gray-900 bg-gray-200 border border-r-0 border-gray-300 rounded-l-md">
                            <svg className="w-4 h-4 text-gray-500" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 2a6 6 0 0 0-6 6c0 3.15 2.577 6.8 5.292 9.236.4.36 1.016.36 1.415 0C13.423 14.8 16 11.15 16 8a6 6 0 0 0-6-6Zm0 9a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z"/>
                            </svg>
                        </span>
                        <input
                         type="date"
                         id="EstablishmentDate"
                         name="EstablishmentDate"
                         placeholder="Establishment Date"
                         value={collegeData.EstablishmentDate}
                         onChange={handleChange}    
                         className="rounded-none rounded-r-lg bg-gray-50 border border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500 flex-1 min-w-0 w-full text-sm p-2.5"
                        />
                    </div>
                </div>

                {/* Highest Package */}
                <div className="mb-5">
                    <label htmlFor="HighestPackage" className="block mb-2 text-sm font-medium text-gray-900">Highest Package</label>
                    <div className="flex">
                        <span className="inline-flex items-center px-3 text-gray-900 bg-gray-200 border border-r-0 border-gray-300 rounded-l-md">
                            <svg className="w-4 h-4 text-gray-500" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 2a6 6 0 0 0-6 6c0 3.15 2.577 6.8 5.292 9.236.4.36 1.016.36 1.415 0C13.423 14.8 16 11.15 16 8a6 6 0 0 0-6-6Zm0 9a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z"/>
                            </svg>
                        </span>
                        <input
                         type="number"
                         id="HighestPackage"
                         name="HighestPackage"
                         placeholder="Highest Package"
                         value={collegeData.HighestPackage}
                         onChange={handleChange}   
                         className="rounded-none rounded-r-lg bg-gray-50 border border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500 flex-1 min-w-0 w-full text-sm p-2.5"
                        />
                    </div>
                </div>

                {/* College URL */}
                <div className="mb-5">
                    <label htmlFor="CollegeURL" className="block mb-2 text-sm font-medium text-gray-900">College URL</label>
                    <div className="flex">
                        <span className="inline-flex items-center px-3 text-gray-900 bg-gray-200 border border-r-0 border-gray-300 rounded-l-md">
                            <svg className="w-4 h-4 text-gray-500" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 2a6 6 0 0 0-6 6c0 3.15 2.577 6.8 5.292 9.236.4.36 1.016.36 1.415 0C13.423 14.8 16 11.15 16 8a6 6 0 0 0-6-6Zm0 9a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z"/>
                            </svg>
                        </span>
                        <input
                         type="text"
                         id="CollegeURL"
                         name="CollegeURL"
                         placeholder="College URL"
                         value={collegeData.CollegeURL}
                         onChange={handleChange} 
                         className="rounded-none rounded-r-lg bg-gray-50 border border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500 flex-1 min-w-0 w-full text-sm p-2.5"
                        />
                    </div>
                </div>

                {/* File Uploads */}
                <div className="mb-4">
                    <label className="block text-gray-700">Upload College Logo</label>
                    <input
                        type="file"
                        name="logoURL"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="w-full p-2 border rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-400"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700">Upload College Photo</label>
                    <input
                        type="file"
                        name="CollegePhotoUrl"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="w-full p-2 border rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-400"
                    />
                </div>

                {/* Submit Button */}
                <button type="submit" className="w-full py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-400 transition duration-150">
                    Submit
                </button>
            </form>
        </div>
    );
};

export default CollegeList;
