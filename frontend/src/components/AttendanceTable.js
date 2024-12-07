import React, { useEffect, useState } from 'react';
import { auth, db } from './firebase';
import { collection, doc, getDocs, getDoc, setDoc } from 'firebase/firestore';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import * as XLSX from 'xlsx'; // Import the xlsx library
import Navbar from './navbar';
import Footer from './footer';

const AttendanceTable = () => {
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [currentDate] = useState(new Date().toISOString().split('T')[0]);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchUserId = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        setUserId(currentUser.uid);
        fetchStudents(currentUser.uid);
      } else {
        console.error("User is not authenticated");
      }
    };
    fetchUserId();
  }, []);

  const fetchStudents = async (userId) => {
    try {
      const studentsCollection = collection(db, "Users", userId, "Students");
      const snapshot = await getDocs(studentsCollection);
      const studentsList = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .sort((a, b) => b.rollNumber - a.rollNumber); // Sort by roll number in descending order
      setStudents(studentsList);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  useEffect(() => {
    if (students.length > 0 && userId) {
      fetchTodayAttendance(userId);
    }
  }, [students, userId]);

  const fetchTodayAttendance = async (userId) => {
    const newAttendance = {};
    await Promise.all(
      students.map(async (student) => {
        const attendanceRef = doc(db, "Users", userId, "Students", student.id, "Attendance", currentDate);
        const attendanceSnap = await getDoc(attendanceRef);
        newAttendance[student.id] = attendanceSnap.exists() ? attendanceSnap.data() : initializeAttendance();
      })
    );
    setAttendance(newAttendance);
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

  const toggleAttendance = (studentId, className) => {
    setAttendance((prevAttendance) => ({
      ...prevAttendance,
      [studentId]: {
        ...prevAttendance[studentId],
        [className]: prevAttendance[studentId][className] === "Present" ? "Absent" : "Present",
      },
    }));
  };

  const saveAttendance = async () => {
    await Promise.all(
      Object.entries(attendance).map(async ([studentId, classes]) => {
        const attendanceRef = doc(db, "Users", userId, "Students", studentId, "Attendance", currentDate);
        await setDoc(attendanceRef, classes, { merge: true });
      })
    );
    toast.success("Attendance saved successfully!");
  };

  // Function to download attendance as Excel file
  const downloadAttendanceExcel = () => {
    const attendanceData = students.map((student) => ({
      RollNumber: student.rollNumber || "N/A",
      Name: student.name || "N/A",
      ...attendance[student.id],
    }));

    const worksheet = XLSX.utils.json_to_sheet(attendanceData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");

    XLSX.writeFile(workbook, `Attendance_${currentDate}.xlsx`);
  };

  return (
    <div className="p-6 bg-gray-100">
      <Navbar />
      <ToastContainer />
      <h1 className="text-3xl font-semibold pt-20 mb-6 text-indigo-700">Attendance for {currentDate}</h1>
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
          {students.length > 0 ? (
            students.map((student, index) => (
              <tr key={student.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-100"}>
                <td className="px-4 py-2 border border-indigo-200">{student.rollNumber || "N/A"}</td>
                <td className="px-4 py-2 border border-indigo-200">{student.name || "N/A"}</td>
                {Array.from({ length: 7 }, (_, i) => (
                  <td key={i} className="px-4 py-2 border border-indigo-200 text-center">
                    <button
                      onClick={() => toggleAttendance(student.id, `Class${i + 1}`)}
                      className={`px-4 py-2 rounded-lg font-semibold text-white ${
                        attendance[student.id]?.[`Class${i + 1}`] === "Present" ? "bg-green-500" : "bg-red-500"
                      }`}
                    >
                      {attendance[student.id]?.[`Class${i + 1}`] === "Present" ? "P" : "A"}
                    </button>
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="9" className="text-center py-4 text-gray-700">No students available</td>
            </tr>
          )}
        </tbody>
      </table>
      <div className="flex space-x-4">
        <button
          onClick={saveAttendance}
          className="bg-indigo-600 text-white p-3 my-6 rounded-lg hover:bg-indigo-700 font-semibold transition duration-300"
        >
          Save Today's Attendance
        </button>
        <button
          onClick={downloadAttendanceExcel}
          className="bg-green-600 text-white p-3 my-6 rounded-lg hover:bg-green-700 font-semibold transition duration-300"
        >
          Download as Excel
        </button>
      </div>
      <Footer />
    </div>
  );
};

export default AttendanceTable;
