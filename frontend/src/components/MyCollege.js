import Navbar from './navbar';
import Footer from './footer';
import React, { useEffect, useState } from "react";
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { auth, db } from './firebase';
import { collection, doc, getDocs, getDoc, query, orderBy } from 'firebase/firestore';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import jsPDF from 'jspdf';
import 'jspdf-autotable'; // Importing the autoTable plugin
import * as XLSX from "xlsx";
import TakeAttendance from './TakeAttendance';
import LoadingDots from './LoadingDots';


function MyCollege() {
  const [colorIndex, setColorIndex] = useState(0);

   // Array of colors for background
   const colors = [
    "bg-slate-200",
    "bg-gray-300",
    "bg-green-100",
    "bg-yellow-100",
    "bg-blue-200",
    "bg-purple-200",
    "bg-pink-200",
    "bg-teal-200",
    "bg-indigo-200",
  ];

  const changeBackgroundColor = () => {
    setColorIndex((prevIndex) => (prevIndex + 1) % colors.length);
  };

  return (
    <div className={` ${colors[colorIndex]} transition-colors duration-500`}>
      <div className="p-6 ">
      <Navbar />
      </div>
      <button
    className="w-12 h-12 rounded-full bg-blue-500 hover:bg-blue-600 flex justify-center items-center m-4"
    onClick={changeBackgroundColor}
  >
    <img
      src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Linear_RGB_color_wheel.png/330px-Linear_RGB_color_wheel.png"
      alt="Change Background"
      className="w-full h-full object-cover rounded-full"
    />
  </button>
      <div className="pb-16"><StatsComponent /></div>
      
      <Footer />
    </div>
  );
}

const StatsComponent = () => {
  const [totalStudentStrength, setTotalStudentStrength] = useState(0);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [attendanceData, setAttendanceData] = useState({});
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

 

// Add this function to export to Excel
const exportToExcel = (attendanceData) => {
  const worksheet = XLSX.utils.json_to_sheet(
    Object.values(attendanceData).map(student => ({
      RollNumber: student.rollNumber,
      Name: student.name,
      ...student.attendance // Spread attendance data into the object
    }))
  );

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");

  // Create Excel file
  XLSX.writeFile(workbook, `Attendance_${new Date().toISOString().split('T')[0]}.xlsx`);
};

const exportToPDF = (attendanceData) => {
  try{
  console.log(attendanceData);
  const doc = new jsPDF();
  doc.setFontSize(12);

  // Set title
  doc.text(`Attendance for ${selectedDate.toDateString()}`, 14, 20);

  // Define table columns
  const tableColumn = [
    'Roll Number',
    'Student Name',
    'Class 1',
    'Class 2',
    'Class 3',
    'Class 4',
    'Class 5',
    'Class 6',
    'Class 7'
  ];

  // Define table rows
  const tableRows = Object.values(attendanceData).map(student => [
    student.rollNumber,
    student.name,
    student.attendance.Class1 || 'Absent',
    student.attendance.Class2 || 'Absent',
    student.attendance.Class3 || 'Absent',
    student.attendance.Class4 || 'Absent',
    student.attendance.Class5 || 'Absent',
    student.attendance.Class6 || 'Absent',
    student.attendance.Class7 || 'Absent'
  ]);

  // Add autoTable to the document
  doc.autoTable(tableColumn, tableRows, { startY: 30 }); // Adjust startY for position
  doc.save(`Attendance_${new Date().toISOString().split('T')[0]}.pdf`);
}catch(error){
  toast.error(error.message);
}
};




  useEffect(() => {
    const fetchTotalStudentStrength = async () => {
      try {
        const userId = auth.currentUser?.uid;
        if (!userId) {
          setError("User not authenticated");
          return;
        }
        const studentsCollection = collection(db, "Users", userId, "Students");
        const snapshot = await getDocs(studentsCollection);
        setTotalStudentStrength(snapshot.docs.length);
      } catch (error) {
        console.error("Error fetching total student strength:", error);
        setError("Failed to fetch student strength");
      }
    };

    fetchTotalStudentStrength();
  }, []);

  const fetchAttendanceForDate = async (date) => {
    setLoading(true); // Start loading
    try {
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1); // Increment date by one day
  
      const dateKey = nextDate.toISOString().split('T')[0];
      const userId = auth.currentUser?.uid;
      if (!userId) {
        setError("User not authenticated");
        return;
      }
  
      const studentsCollection = collection(db, "Users", userId, "Students");
      const studentsQuery = query(studentsCollection, orderBy("rollNumber", "asc"));
      const snapshot = await getDocs(studentsQuery);
  
      const attendancePromises = snapshot.docs.map(async (studentDoc) => {
        const studentId = studentDoc.id;
        const attendanceRef = doc(db, "Users", userId, "Students", studentId, "Attendance", dateKey);
        const attendanceSnap = await getDoc(attendanceRef);
  
        return {
          id: studentId,
          rollNumber: studentDoc.data().rollNumber || "N/A",
          name: studentDoc.data().name || "N/A",
          attendance: attendanceSnap.exists() ? attendanceSnap.data() : initializeAttendance()
        };
      });
  
      const attendanceList = await Promise.all(attendancePromises);
  
      // Explicitly sort attendanceList by rollNumber to ensure order
      attendanceList.sort((a, b) => a.rollNumber - b.rollNumber);
  
      const attendanceMap = attendanceList.reduce((acc, student) => {
        acc[student.id] = student;
        return acc;
      }, {});
  
      setAttendanceData(attendanceMap);
    } catch (error) {
      console.error("Error fetching attendance:", error);
      setError("Failed to fetch attendance");
    } finally {
      setLoading(false); // End loading
    }
  };
  
  const initializeAttendance = () => ({
    Class1: "Absent",
    Class2: "Absent",
    Class3: "Absent",
    Class4: "Absent",
    Class5: "Absent",
    Class6: "Absent",
    Class7: "Absent",
  });

  const handleDateChange = (date) => {
    setSelectedDate(date);
    fetchAttendanceForDate(date);
    toast.info(`Selected Date: ${date.toDateString()}`, {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: true,
      theme: "colored"
    });
  };

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  if (error) {
    return <p className="text-red-600 text-center mt-4">{error}</p>;
  }

  return (
    <div >
      <ToastContainer />
      {/* <h1 className="text-3xl font-bold text-blue-600 mt-12 mb-6 text-center">
        College Dashboard
      </h1> */}
<div className="flex flex-col md:flex-row justify-between gap-4 p-8 mt-12">
  {/* Left Column */}
  <div className="bg-neutral-200 flex flex-col items-center lg:ml-24 md:w-1/2 text-white shadow-xl rounded-lg w-full max-w-md mb-4 p-6 transition-all transform hover:scale-105 hover:shadow-2xl">
    <div className="border-l-green-900 shadow-xl rounded-lg bg-slate-100 p-4">
      <p className="text-xl sm:text-2xl md:text-3xl font-semibold text-center text-black">
        Total Student Strength
      </p>
      <p className="text-5xl font-extrabold text-sky-600 text-center mt-3">
        {totalStudentStrength}
      </p>
    </div>
    {/* Buttons below Total Student Strength */}
    <div className="flex flex-col items-center gap-4 sm:mt-4 md:mt-6 lg:mt-14">
      <button
        onClick={openModal}
        className="bg-yellow-400 text-blue-800 font-semibold py-3 px-8 rounded-full transition-all hover:bg-yellow-500 focus:outline-none transform hover:scale-105 shadow-lg"
      >
        View Attendance
      </button>
      <button
        onClick={() => window.location.href = '/attendance'}
        className="bg-yellow-400 text-blue-800 font-semibold py-3 px-8 rounded-full transition-all hover:bg-yellow-500 focus:outline-none transform hover:scale-105 shadow-lg"
      >
        Take Attendance
      </button>
    </div>
  </div>

  {/* Right Column: Calendar */}
  <div className="bg-white shadow-xl rounded-lg p-6 w-full max-w-md mb-4 transition-all transform hover:scale-105 hover:shadow-2xl md:w-2/3 md:h-2/5">
    <Calendar onChange={handleDateChange} value={selectedDate} className="w-full h-full" />
    
    {/* Conditionally render Selected Date text */}
    {selectedDate && (
      <p className="text-center mt-6 text-lg font-medium text-gray-700">
        Selected Date: <span className="text-blue-500">{selectedDate.toDateString()}</span>
      </p>
    )}
  </div>

  {/* Background Change Button */}
 <p></p>
</div>






      {loading && (
      
      <LoadingDots />
      )}

{showModal && !loading && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div className="relative bg-white rounded-lg shadow-lg p-6 w-full max-w-4xl">
      <button
        onClick={closeModal}
        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-semibold"
      >
        ✕
      </button>
      <h2 className="text-2xl font-semibold text-blue-500 mb-4 text-center">
        Attendance for {selectedDate.toDateString()}
      </h2>
      <table className="table-auto w-full border-separate border-spacing-0">
        <thead>
          <tr className="bg-indigo-600 text-white">
            <th className="px-4 py-2 border border-indigo-700">Roll Number</th>
            <th className="px-4 py-2 border border-indigo-700">Student Name</th>
            {Array.from({ length: 7 }, (_, i) => (
              <th key={i} className="px-4 py-2 border border-indigo-700">Class {i + 1}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Object.values(attendanceData).map((student, index) => (
            <tr key={student.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-100"}>
              <td className="px-4 py-2 border border-indigo-200">{student.rollNumber}</td>
              <td className="px-4 py-2 border border-indigo-200">{student.name}</td>
              {Array.from({ length: 7 }, (_, i) => (
                <td key={i} className="px-4 py-2 border border-indigo-200 text-center">
                  {student.attendance ? (student.attendance[`Class${i + 1}`] || "Absent") : "Absent"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-center mt-4">
        <button
          onClick={() => exportToExcel(attendanceData)}
          className="bg-green-500 text-white font-semibold py-2 px-4 rounded-md mr-2"
        >
          Download Excel
        </button>
        <button onClick={() => exportToPDF(attendanceData)} className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600">
  Download PDF
</button>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default MyCollege;
