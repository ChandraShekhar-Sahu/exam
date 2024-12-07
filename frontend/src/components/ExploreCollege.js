import React, { useState, useEffect, useRef } from 'react';
import { get, child, ref } from 'firebase/database';
import { database } from './firebase';
import { useNavigate } from 'react-router-dom';
import './ExploreCollege.css';
import LoadingDots from './LoadingDots';
import Navbar from './navbar';
import Footer from './footer';

function ExploreCollege() {
    const [collegeCards, setCollegeCards] = useState([]);
    const [filteredColleges, setFilteredColleges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState(''); // state to store search term
    const navigate = useNavigate();
    const observer = useRef();

    // Fetch all college data from the database
    useEffect(() => {
        const fetchCollegeData = async () => {
            try {
                const dbRef = ref(database);
                const snapshot = await get(child(dbRef, 'colleges/'));
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    const colleges = Object.values(data);
                    setCollegeCards(colleges);
                    setFilteredColleges(colleges); // Set initial filtered colleges as all
                    setLoading(false);
                } else {
                    console.log('No data available');
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchCollegeData();
    }, []);

    // Filter colleges based on location
    const handleSearchChange = (e) => {
        const value = e.target.value.toLowerCase();
        setSearchTerm(value);

        const filtered = collegeCards.filter((card) =>
            card.Location?.toLowerCase().includes(value)
        );
        setFilteredColleges(filtered);
    };

    // Lazy loading observer callback
    const lastCollegeCardRef = useRef();

    useEffect(() => {
        const options = {
            root: null,
            rootMargin: '20px',
            threshold: 1.0,
        };

        const handleObserver = (entities, observer) => {
            const target = entities[0];
            if (target.isIntersecting) {
                // Trigger lazy load or pagination here if necessary
                console.log('Last card is in view!');
            }
        };

        const observerInstance = new IntersectionObserver(handleObserver, options);
        if (lastCollegeCardRef.current) {
            observerInstance.observe(lastCollegeCardRef.current);
        }

        return () => {
            if (lastCollegeCardRef.current) {
                observerInstance.unobserve(lastCollegeCardRef.current);
            }
        };
    }, []);

    return (
        <div className="explore-colleges-container">
            <Navbar />   
            <div className="text-center mb-6 pt-16">
                <h2 className="text-4xl font-bold">Explore Colleges</h2>
            </div>

            {/* Search Bar */}
            <div className="search-bar-container mb-6">
                <input
                    type="text"
                    placeholder="Search by location"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="search-bar"
                />
            </div>

            <div className="college-cards-container">
                {/* Show loading spinner while data is being fetched */}
                {loading ? (
                    <LoadingDots />
                ) : (
                    <div className="college-cards">
                        {filteredColleges.length > 0 ? (
                            filteredColleges.map((card, index) => (
                                <div
                                    className="college-card"
                                    key={index}
                                    ref={index === filteredColleges.length - 1 ? lastCollegeCardRef : null}
                                    onClick={() => window.open(card.CollegeURL, '_blank')} // Open in a new tab
                                >
                                    <div className="college-card-img" style={{ backgroundImage: `url(${card.CollegePhotoUrl || 'default-image-url'})` }} />
                                    <div className="college-card-content">
                                        <div className="college-name">{card.Name || 'Name not available'}</div>
                                        <p className="college-description">
                                            {card.Description?.length > 100
                                                ? card.Description.slice(0, 100) + '...'
                                                : card.Description || 'Description not available'}
                                        </p>
                                    </div>
                                    <div className="college-details">
                                        <span className="college-location">Location: {card.Location || 'N/A'}</span>
                                        <span className="college-establishment">
                                            Established: {card.EstablishmentDate || 'N/A'}
                                        </span>
                                        <span className="college-highest-package">
                                            Highest Package: {card.HighestPackage || 'N/A'}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="no-results">
                                No colleges found for the specified location.
                            </div>
                        )}
                    </div>
                )}
            </div>
            <Footer />
      
        </div>
    );
}

export default ExploreCollege;
