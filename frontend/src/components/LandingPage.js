import React, { useEffect, useState } from 'react';
import { getDatabase, ref, get, child } from 'firebase/database';
import app, { database } from './firebase'; // Import from the firebase.js file
import CollegeCard from './CollegeCard'; // Ensure you have a CollegeCard component
import Navbar from './navbar';
import Footer from './footer';
import "./LandingPage.css"
import { useNavigate } from 'react-router-dom'; 

function LandingPage() {
    return (
        <div>
            <Navbar />
            <HeroSection />
            <CollegeSection />
            <AboutUsSection />
            <FeatureSection />
            <Footer />
        </div>
    );
}

// Import useHistory

function HeroSection() {
    const navigate = useNavigate(); // Initialize navigate

    const handleGetStarted = () => {
        navigate('/login'); // Redirect to /login
    };

    return (
        <div className="pt-8">
        <div
            className='hero-section'
            style={{
                position: 'relative',
                backgroundImage: 'url("../../static/images/landing_page.jpg")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                color: '#fff',
                textAlign: 'center',
            }}
        >
            <div className='overlay'>
                <div className='content text-slate-900'>
                    <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                        Discover Your Future:
                    </h1>
                    <p className="pl-4" style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>
                        Explore College Reviews, Register, and Stay on Track with Daily Attendance!
                    </p>
                    <button
                        style={{
                            padding: '1rem 2rem',
                            fontSize: '1.2rem',
                            fontWeight: 'bold',
                            color: '#fff',
                            backgroundColor: '#007bff',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            transition: 'opacity 0.3s',
                        }}
                        onClick={handleGetStarted} // Set the click handler
                        onMouseEnter={(e) => e.target.style.opacity = 0.8}
                        onMouseLeave={(e) => e.target.style.opacity = 1}
                    >
                        Get Started
                    </button>
                </div>
            </div>
        </div>
        </div>
    );
}





function CollegeSection() {
    const [collegeCards, setCollegeCards] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCollegeData = async () => {
            try {
                const dbRef = ref(database);
                const snapshot = await get(child(dbRef, 'colleges/'));
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    const collegeArray = Object.values(data).slice(0, 5); // Get first 5 documents
                    setCollegeCards(collegeArray);
                } else {
                    console.log('No data available');
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchCollegeData();
    }, []);

    // Combine college cards array twice for continuous looping effect
    const loopingCards = [...collegeCards, ...collegeCards];

    return (
        <div id="college-card" className="bg-neutral-200" >
            <div className="text-center mb-6 pt-16">
                <h2 className="text-4xl font-bold">Explore Colleges</h2>
            </div>
            {/* Scrolling container */}
            <div className="scroll-container">
                <div className="scroll-content">
                    {loopingCards.map((card, index) => (
                        <div
                            className="max-w-sm bg-white rounded-lg shadow-lg hover:shadow-2xl transform transition-shadow duration-300 ease-in-out"
                            key={index}
                            style={{ minWidth: '280px' }}
                        >
                           
                            <img
                                className="w-full rounded-t-lg"
                                src={card.CollegePhotoUrl || 'default-image-url'}
                                alt={card.Name || 'College Image'}
                                onClick={() => window.open(card.CollegeURL, '_blank')} // Open in a new tab
                            />
                            <div className="px-6 py-4">
                                <div className="font-bold text-xl mb-2">{card.Name || 'Name not available'}</div>
                                <p className="text-gray-700 text-base">
                                    {card.Description || 'Description not available'}
                                </p>
                            </div>
                            <div className="px-6 pt-4 pb-2 flex flex-wrap gap-2">
                                <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700">
                                    Location: {card.Location || 'N/A'}
                                </span>
                                <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700">
                                    Established: {card.EstablishmentDate || 'N/A'}
                                </span>
                                <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700">
                                    Highest Package: {card.HighestPackage || 'N/A'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div id="about-us" className="text-center mt-6">
                <button 
                    className="mt-4 px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
                    onClick={() => navigate('/explore-college')}>
                    View All
                </button>
            </div>
        </div>
    );
}
  
  
  
  

function AboutUsSection() {
    const aboutUsData = [
        {
            imageSrc: "../../static/images/Aboutus4.jpg",
            description: "<b class='text-lg sm:text-xl md:text-4xl'>Our Mission:</b> We empower students by providing essential resources and support to enhance their college experience. We aim to connect students with the information needed to make informed educational decisions.",
        },
        {
            imageSrc: "../../static/images/Aboutus1.jpg",
            description: "<b class='text-lg sm:text-xl md:text-4xl'>Building Community:</b> We believe in the strength of community. Our platform fosters connections among students, alumni, and educators, creating a supportive network that encourages collaboration and shared experiences.",
        },
        {
            imageSrc: "../../static/images/Aboutus2.jpg",
            description: "<b class='text-lg sm:text-xl md:text-4xl'>Commitment to Excellence:</b> Our commitment to excellence drives us to improve continually. We offer up-to-date reviews and tools that help students navigate their academic journeys, ensuring our platform meets the evolving needs of our users.",
        },
        {
            imageSrc: "../../static/images/Aboutus3.jpg",
            description: "<b class='text-lg sm:text-xl md:text-4xl'>Pathways to Success:</b> We are dedicated to creating pathways to success for every student. From academic resources to career guidance, we support you in achieving your goals and unlocking your potential.",
        },
    ];

    return (

  
        <div className='bg-neutral-200'   >
            <h2 className="text-center text-2xl sm:text-3xl md:text-5xl font-bold mb-6">About Us</h2>
            {aboutUsData.map((item, index) => (
                <div className={`flex px-2 items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'} mb-6`} key={index}>
                    <img 
                        src={item.imageSrc} 
                        alt={`About Us ${index + 1}`} 
                        className="w-[45%] sm:w-[48%] md:w-[49%] h-[30vh] sm:h-[40vh] md:h-[50vh] object-cover rounded-md shadow-lg transition-transform duration-300 hover:shadow-2xl hover:shadow-blue-300" 
                        style={{
                            filter: 'drop-shadow(4px 4px 8px rgba(173, 216, 230, 0.7))'
                        }}
                    />
                    <div className="w-1/2 h-[30vh] sm:h-[40vh] md:h-[40vh] flex items-center justify-center p-4 pb-10">
                        <p className="w-full h-full p-4 text-sm sm:text-lg md:text-2xl text-gray-700 bg-slate-300 rounded-md shadow-lg transition-shadow duration-300 hover:shadow-2xl hover:shadow-blue-300" 
                           style={{
                               filter: 'drop-shadow(4px 4px 8px rgba(173, 216, 230, 0.7))'
                           }} 
                           dangerouslySetInnerHTML={{ __html: item.description }} />
                    </div>
                </div>
            ))}
            <div id='feature-card'></div>
        </div>
                  
    );
}

function FeatureSection() {
    const features = [
        {
            title: "Real-time Updates",
            description: "Get instant notifications about college reviews, events, and deadlines.",
        },
        {
            title: "Personalized Recommendations",
            description: "Receive tailored suggestions based on your interests and preferences.",
        },
        {
            title: "Community Engagement",
            description: "Connect with peers, alumni, and mentors through our interactive platform.",
        },
        {
            title: "User-Friendly Interface",
            description: "Navigate easily through a clean and intuitive design that enhances your experience.",
        },
    ];

    return (
        <div  className="bg-neutral-200 pt-20 pb-10">
            <div className="text-center mb-8">
                <h2 className="text-4xl font-bold">Key Features</h2>
                <p className="mt-4 text-lg text-gray-600">
                    Explore the features that make our platform unique and valuable for your college journey.
                </p>
            </div>
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
                {features.map((feature, index) => (
                    <div key={index} className="p-6 bg-gray-100 rounded-lg shadow-md transition-transform duration-300 hover:scale-105">
                        <h3 className="text-xl font-semibold">{feature.title}</h3>
                        <p className="mt-2 text-gray-700">{feature.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}


export default LandingPage;
