import React from 'react';
import '../App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaRocket, FaLaptopCode, FaQuoteLeft, FaQuoteRight } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import HomeCourses from './HomeCourses';

const Home = () => {
  // Educational quotes
  const quotes = [
    {
      text: "Education is the most powerful weapon which you can use to change the world.",
      author: "Nelson Mandela"
    },
    {
      text: "The beautiful thing about learning is that no one can take it away from you.",
      author: "B.B. King"
    },
    {
      text: "Education is not the filling of a pail, but the lighting of a fire.",
      author: "W.B. Yeats"
    }
  ];

  // Random quote selection
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

  return (
    <>
      {/* Hero Section with improved design */}
      <div className="hero-section" style={{
        background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
        color: 'white',
        paddingTop: '80px',
        paddingBottom: '80px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-6">
              <div className="hero-content" style={{ position: 'relative', zIndex: 1 }}>
                <h1 className="display-4 fw-bold mb-4" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
                  Welcome to STUDYHUB
                </h1>
                <p className="lead mb-4">
                  Your ultimate platform for online learning and content creation.
                  Join us to learn from the best courses or create your own educational content.
                </p>
                <div className="d-flex gap-3 flex-wrap">
                  <Link
                    to="/courses"
                    className="btn btn-light btn-lg px-4 py-2"
                    style={{
                      boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <FaRocket className="me-2" /> Explore Courses
                  </Link>
                  <Link
                    to="/signup"
                    className="btn btn-outline-light btn-lg px-4 py-2"
                    style={{ transition: 'all 0.3s ease' }}
                  >
                    <FaLaptopCode className="me-2" /> Get Started
                  </Link>
                </div>
              </div>
            </div>
            <div className="col-md-6 d-flex justify-content-center">
              <div className="hero-image" style={{ 
                position: 'relative',
                animation: 'float 3s ease-in-out infinite',
                filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.2))'
              }}>
                <img
                  src="/main image.png"
                  alt="StudyHub Logo"
                  className="img-fluid"
                  style={{ maxHeight: '400px' }}
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Abstract shapes in background */}
        <div className="shape shape1" style={{
          position: 'absolute',
          width: '150px',
          height: '150px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '50%',
          top: '20%',
          left: '10%',
          animation: 'moveAround 15s linear infinite'
        }}></div>
        <div className="shape shape2" style={{
          position: 'absolute',
          width: '80px',
          height: '80px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '50%',
          top: '60%',
          left: '5%',
          animation: 'moveAround 20s linear infinite'
        }}></div>
        <div className="shape shape3" style={{
          position: 'absolute',
          width: '120px',
          height: '120px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '50%',
          top: '10%',
          right: '15%',
          animation: 'moveAround 18s linear infinite'
        }}></div>
      </div>

      {/* Quote Section */}
      <div className="quote-section py-5" style={{ 
        background: 'linear-gradient(to right, #f5f7fa, #c3cfe2)',
        borderTop: '1px solid rgba(0,0,0,0.05)',
        borderBottom: '1px solid rgba(0,0,0,0.05)'
      }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-10 col-lg-8">
              <div className="quote-content text-center p-4" style={{
                position: 'relative',
              }}>
                <FaQuoteLeft size={30} className="text-primary mb-3" style={{ opacity: 0.6 }} />
                <h3 className="fs-4 fw-normal mb-3" style={{ fontStyle: 'italic', lineHeight: '1.6' }}>
                  {randomQuote.text}
                </h3>
                <p className="fw-bold text-secondary">— {randomQuote.author}</p>
                <FaQuoteRight size={30} className="text-primary mt-3" style={{ opacity: 0.6 }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <HomeCourses />


      {/* Features Section */}
      <div className="features-section py-5" style={{ 
        background: 'linear-gradient(135deg, #8BC6EC 0%, #9599E2 100%)',
        color: 'white'
      }}>
        <div className="container">
          <div className="row text-center g-4">
            <div className="col-md-4">
              <div className="feature-card p-4" style={{ 
                background: 'rgba(255,255,255,0.1)', 
                borderRadius: '12px',
                backdropFilter: 'blur(5px)'
              }}>
                <div className="feature-icon mb-3 d-inline-block p-3" style={{ 
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: '50%'
                }}>
                  <i className="fas fa-laptop-code fa-2x"></i>
                </div>
                <h3 className="h5 mb-3">Learn Anywhere</h3>
                <p className="mb-0">Access our courses anytime, anywhere, on any device.</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="feature-card p-4" style={{ 
                background: 'rgba(255,255,255,0.1)', 
                borderRadius: '12px',
                backdropFilter: 'blur(5px)'
              }}>
                <div className="feature-icon mb-3 d-inline-block p-3" style={{ 
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: '50%'
                }}>
                  <i className="fas fa-certificate fa-2x"></i>
                </div>
                <h3 className="h5 mb-3">Get Certified</h3>
                <p className="mb-0">Earn certificates upon completion of our courses.</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="feature-card p-4" style={{ 
                background: 'rgba(255,255,255,0.1)', 
                borderRadius: '12px',
                backdropFilter: 'blur(5px)'
              }}>
                <div className="feature-icon mb-3 d-inline-block p-3" style={{ 
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: '50%'
                }}>
                  <i className="fas fa-users fa-2x"></i>
                </div>
                <h3 className="h5 mb-3">Join Community</h3>
                <p className="mb-0">Connect with like-minded learners and instructors.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add CSS animations */}
      <style jsx>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
          100% { transform: translateY(0px); }
        }
        
        @keyframes moveAround {
          0% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(20px, 20px) rotate(90deg); }
          50% { transform: translate(0, 40px) rotate(180deg); }
          75% { transform: translate(-20px, 20px) rotate(270deg); }
          100% { transform: translate(0, 0) rotate(360deg); }
        }
        
        .card:hover {
          transform: translateY(-10px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.1) !important;
        }
        
        .btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 15px rgba(0,0,0,0.2);
        }
      `}</style>
    </>
  );
};

export default Home;