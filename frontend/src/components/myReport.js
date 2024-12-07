import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import { useNavigate } from "react-router-dom";
import { collection, doc, getDoc } from "firebase/firestore";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import StdNavbar from "./stdnavbar";
import { Button, Modal, Typography } from "@mui/material";

import Calendar from "react-calendar";
import { jsPDF } from "jspdf";
import LoadingDots from "./LoadingDots";


// Register necessary Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function MyReport() {
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studentId, setStudentId] = useState(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const navigate = useNavigate();
  const name = localStorage.getItem('studentname');
  const rollnum = localStorage.getItem('studentroll');
  const StudentId = localStorage.getItem("studentId");

  useEffect(() => {
    if (StudentId) {
      setStudentId(StudentId);
    } else {
      setShowLoginPrompt(true);
    }
  }, [StudentId]);

  useEffect(() => {
    const fetchAttendanceData = async () => {
      if (!studentId) {
        console.error("Student ID is not provided!");
        return;
      }

      try {
        const attendanceRef = collection(
          db,
          "Users",
          "b2OcTcWAkubNYoyEBr2ZHuiOxCc2",
          "Students",
          studentId,
          "Attendance"
        );

        const today = new Date();
        const last7DaysData = [];

        for (let i = 0; i < 7; i++) {
          const date = new Date(today);
          date.setDate(today.getDate() - i);
          const formattedDate = date.toISOString().split('T')[0];

          const attendanceDocRef = doc(attendanceRef, formattedDate);
          const docSnap = await getDoc(attendanceDocRef);

          if (docSnap.exists()) {
            last7DaysData.push({ date: formattedDate, data: docSnap.data() });
          } else {
            last7DaysData.push({ date: formattedDate, data: null });
          }
        }

        setAttendanceData(last7DaysData.reverse());
      } catch (error) {
        console.error("Error fetching attendance data: ", error);
      } finally {
        setLoading(false);
      }
    };

    if (studentId) {
      fetchAttendanceData();
    }
  }, [studentId]);

  const prepareChartData = () => {
    const dates = attendanceData.map((entry) => entry.date);
    const sortedClassKeys = ["Class1", "Class2", "Class3", "Class4", "Class5", "Class6", "Class7"];
  
    const datasets = sortedClassKeys.map((classKey) => {
      return {
        label: classKey,
        data: attendanceData.map(entry => entry.data ? (entry.data[classKey] === "Present" ? 1 : 0) : 0),
        backgroundColor: `rgba(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, 0.6)`,
        borderColor: `rgba(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, 1)`,
        borderWidth: 1,
        
      };
    });
  
    return {
      labels: dates,
      datasets: datasets,
    };
  };
  return  (
    <div
  >
    
    {showLoginPrompt ? (
      <Modal open={showLoginPrompt} onClose={() => {}}>
        <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-r from-blue-50 via-white to-blue-50 p-8 rounded-lg shadow-2xl border border-gray-200">
          <Typography variant="h5" className="mb-4 text-gray-800 font-bold">
            You need to log in to view this Your Attendance.
          </Typography>
          <div className="flex gap-4 mt-4">
            <Button
              variant="contained"
              color="primary"
              className="rounded-full px-6 py-2"
              onClick={() => navigate('/')}
            >
              Go to Home
            </Button>
            <Button
              variant="contained"
              color="secondary"
              className="rounded-full px-6 py-2"
              onClick={() => navigate('/login')}
            >
              Login
            </Button>
          </div>
        </div>
      </Modal>
    ) : (
      <div>
        <div  className="min-h-screen p-6"
    style={{
      backgroundImage: `url('../../static/images/college.jpg')`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
       backgroundSize: 'cover', // Ensures the background covers the container
    minHeight: '95vh', // Sets the height to 90% of the viewport height

    }}
    >
      <StdNavbar />
      {/* Top Section: Student Info */}
      <div className="flex flex-col items-start justify-center w-full mb-6 p-6 md:mb-0">
        <div className="flex items-center mb-4">
          <div className="w-16 h-16 flex items-center justify-center bg-amber-600 text-neutral-700 text-4xl font-bold rounded-full">
            {name ? name.charAt(0).toUpperCase() : "?"}
          </div>
          <div className="ml-4">
            <h1 className="text-2xl text-white font-semibold">{name}</h1>
            <p className="text-lg text-white">Roll Number: {rollnum}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-row items-center w-full mb-6 sm:ml-10 md:ml-20 lg:ml-28 md:items-center">
  {/* Left Component: Sphere for Classes Attended */}
  <div className="flex flex-col items-center mb-6 md:mb-4">
    <div className="w-40 h-40 rounded-full flex items-center justify-center bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 text-white font-bold text-2xl shadow-lg">
      {attendanceData && attendanceData.length > 0 && attendanceData.filter(entry => entry.data)
        .map(entry => Object.values(entry.data).filter(status => status === 'Present').length).reduce((a, b) => a + b, 0)}{' '}
      / {attendanceData.length * 7}
    </div>
    <p className="mt-4 text-white text-lg">Classes Attended</p>
  </div>

  {/* Right Component: Yesterday's Attendance */}
  <div className="flex w-full h-full justify-center">
    <YesterdayAttendance />
  </div>
</div>
</div>
      {/* 7-day Attendance Report */}
      <div className="w-full   shadow-md rounded-lg">
        {loading ? (
          <p className="text-center  bg-slate-300 text-gray-600">Loading attendance data...</p>
        ) : (

        <div className="w-full min-h-[100vh] p-6 bg-slate-300"

>

          <div className="w-full">
            <h2 className="text-3xl font-semibold text-stone-900 text-start m-4">
              Attendance Report for {name} ({rollnum})
            </h2>
            <div className="relative text-white" style={{ height: '350px' }}>
              <Bar
                data={prepareChartData()}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    title: {
                      display: true,
                      text: 'Attendance Report for Last 7 Days',
                      color:'black',
                      font: {
                        size: 28, // Increase font size 
                      },
                    },
                    legend: {
                      position: 'top',
                      font: {
                        size: 20, // Increase font size 
                      },
                    },
                  },
                  scales: {
                    x: {
                      ticks: {
                        color: 'black', // Makes the x-axis labels white
                        font: {
                          size: 14, // Increase font size for x-axis labels
                        },
                      },
                      title: {
                        display: true,
                        // text: '', // Example label for x-axis
                        color: 'black', // Title color
                        font: {
                          size: 20, // Increase font size for x-axis title
                        },
                      },
                    },
                    y: {
                      beginAtZero: true,
                      ticks: {
                        stepSize: 1,
                        callback: function (value) {
                          return value === 1 ? 'Present' : 'Absent';
                        },
                        font: {
                          size: 22, // Increase font size 
                        },
                      },
                    },
                  },
                }}
              />
            </div>
          </div>
                <div>
                <AttendanceCalendar studentId={studentId} />
                  </div>
          </div>
        )}
      </div>
    </div>
  )}
</div>

    

  
  );
}
function YesterdayAttendance() {
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [studentId, setStudentId] = useState(null);

  useEffect(() => {
    const storedStudentId = localStorage.getItem("studentId");
    if (storedStudentId) {
      setStudentId(storedStudentId);
    } else {
      console.error("No student ID found in local storage!");
    }
  }, []);

  useEffect(() => {
    const fetchYesterdayAttendance = async () => {
      if (!studentId) {
        console.error("Student ID is not provided!");
        return;
      }

      try {
        const attendanceRef = collection(
          db,
          "Users",
          "b2OcTcWAkubNYoyEBr2ZHuiOxCc2",
          "Students",
          studentId,
          "Attendance"
        );

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const formattedDate = yesterday.toISOString().split('T')[0];

        const attendanceDocRef = doc(attendanceRef, formattedDate);
        const docSnap = await getDoc(attendanceDocRef);

        if (docSnap.exists()) {
          setAttendanceData({ date: formattedDate, data: docSnap.data() });
        } else {
          console.log("No attendance data found for yesterday.");
          setAttendanceData(null);
        }
      } catch (error) {
        console.error("Error fetching attendance data: ", error);
      } finally {
        setLoading(false);
      }
    };

    if (studentId) {
      fetchYesterdayAttendance();
    }
  }, [studentId]);

  const prepareChartData = () => {
    if (!attendanceData || !attendanceData.data) return null;

    const sortedClassKeys = ["Class1", "Class2", "Class3", "Class4", "Class5", "Class6", "Class7"];
    const labels = sortedClassKeys;
    const data = labels.map(classKey => (attendanceData.data[classKey] === "Present" ? 1 : 0));

    return {
      labels: labels,
      datasets: [
        {
          label: `Attendance for ${attendanceData.date}`,
          data: data,
          backgroundColor: data.map(value => (value === 1 ? "#4CAF50" : "#F44336")), // Green for present, red for absent
          borderColor: "#333",
          borderWidth: 1,
        },
        
      ],

    };
  };

  if (loading) return <div> Loading... </div>;
  if (!attendanceData) return <div>No data available for yesterday.</div>;

  return (
    <div className=" hidden sm:block  text-white" style={{ width: '60%', height: '50%' }}>
    <h1 className="text-3xl text-white text-center">Yesterday's Attendance</h1>
    <Bar
      data={prepareChartData()}
      options={{
        scales: {
          x: {
            ticks: {
              color: 'white', // Makes the x-axis labels white
              font: {
                size: 14, // Increase font size for x-axis labels
              },
            },
            title: {
              display: true,
              text: 'Classes', // Example label for x-axis
              color: 'white', // Title color
              font: {
                size: 16, // Increase font size for x-axis title
              },
            },
          },
          y: {
            title: {
              display: true,
              text: 'Attendance Status',
              color: 'white', // Title color for y-axis
              font: {
                size: 16, // Increase font size for y-axis title
              },
            },
            min: 0,
            max: 1,
            ticks: {
              stepSize: 1,
              callback: function (value) {
                return value === 1 ? 'Present' : 'Absent';
              },
              color: 'white', // Makes the y-axis labels white
              font: {
                size: 14, // Increase font size for y-axis labels
              },
            },
          },
        },
      }}
    />
  </div>
  
  );
}


function AttendanceCalendar({ studentId }) {
  const [date, setDate] = useState(null);  // Initially no date is selected
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Format the date to "YYYY-MM-DD"
  const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // months are 0-based
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  };

  // Fetch attendance data for the selected date
  const fetchAttendance = async (selectedDate) => {
    setLoading(true);
    const formattedDate = formatDate(selectedDate);
    try {
      const attendanceRef = collection(
        db,
        "Users",
        "b2OcTcWAkubNYoyEBr2ZHuiOxCc2",
        "Students",
        studentId,
        "Attendance"
      );
      const attendanceDocRef = doc(attendanceRef, formattedDate);
      const docSnap = await getDoc(attendanceDocRef);

      if (docSnap.exists()) {
        setAttendanceData(docSnap.data());
      } else {
        setAttendanceData(null);
      }
    } catch (error) {
      console.error("Error fetching attendance data: ", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle date selection from the calendar
  const handleDateSelect = (selectedDate) => {
    setDate(selectedDate);
    fetchAttendance(selectedDate);
  };

  // Generate PDF for the selected date's attendance data
  const generatePDF = () => {
    if (!attendanceData) {
      alert("No attendance data available.");
      return;
    }

    const doc = new jsPDF();
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);

    const title = "Attendance Report for " + formatDate(date);
    doc.text(title, 10, 10);

    let yPosition = 20;

    // Sort class names alphabetically
    const sortedClassNames = Object.entries(attendanceData).sort(([classNameA], [classNameB]) => 
      classNameA.localeCompare(classNameB)
    );

    // Display attendance data in ascending order with colors and bold class names
    for (const [className, status] of sortedClassNames) {
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0); // Set class name color to black
      doc.text(`${className}: `, 10, yPosition);
      doc.setFont("helvetica", "normal");

      const statusColor = status === "Present" ? "green" : status === "Absent" ? "red" : "black";
      doc.setTextColor(statusColor);
      doc.text(status, 40, yPosition);
      yPosition += 10;
    }

    doc.save("attendance_report.pdf");
  };

  return (
    <div className="flex flex-col md:flex-row justify-between p-4 space-y-4 md:space-y-0">
      {/* Calendar Section */}
      <div className="flex-1 md:w-1/2">
        <h2 className="text-xl font-semibold mb-4">Select a Date to View Attendance</h2>
        <Calendar
          onChange={handleDateSelect}
          value={date}
          className="my-calendar w-full"
        />
      </div>

      {/* Attendance Details Section */}
      <div
        className="flex-1 md:w-1/2 mt-4 md:mt-0 p-6 bg-inherit  rounded-lg shadow-lg"
      >
        {date && (
          <>
            <h3 className="text-xl font-semibold mb-4 text-center">Attendance for {formatDate(date)}</h3>
            {loading ? (
              <p className="text-center">Loading attendance...</p>
            ) : (
              <div className="text-center">
                {attendanceData ? (
                  <div>
                    <ul className="space-y-2">
                      {/* Display class names in ascending order */}
                      {Object.entries(attendanceData)
                        .sort(([classNameA], [classNameB]) => classNameA.localeCompare(classNameB))
                        .map(([className, status], index) => (
                          <li
                            key={index}
                            className={`font-bold text-black ${status === "Present" ? "text-green-800" : "text-red-600"}`}
                          >
                            {className}: {status}
                          </li>
                      ))}
                    </ul>
                    <button
                      onClick={generatePDF}
                      className="mt-4 px-6 py-3 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400"
                    >
                      Download PDF
                    </button>
                  </div>
                ) : (
                  <p>No attendance data available for this date.</p>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}


export default MyReport;
