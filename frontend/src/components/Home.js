import React from 'react';
import '../App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaRocket, FaLaptopCode, FaBookOpen, FaQuoteLeft, FaQuoteRight } from 'react-icons/fa';

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

  // Course categories with improved images and styling
  const courses = [
    {
      title: 'Artificial Intelligence',
      description: 'Learn about machine learning, neural networks, and more.',
      image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995',
      color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    },
    {
      title: 'Web Development',
      description: 'Master HTML, CSS, JavaScript, and modern frameworks.',
      image: 'https://images.unsplash.com/photo-1547658719-da2b51169166',
      color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
    },
    {
      title: 'Cyber Security',
      description: 'Understand network security and ethical hacking.',
      image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3',
      color: 'linear-gradient(135deg, #5ee7df 0%, #b490ca 100%)'
    },
    {
      title: 'Data Science',
      description: 'Analyze data and build predictive models with Python.',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71',
      color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    },
    {
      title: 'Cloud Computing',
      description: 'Explore cloud services and infrastructure.',
      image: 'https://images.unsplash.com/photo-1603732551658-5fabbafa84eb',
      color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
    },
    {
      title: 'Game Development',
      description: 'Create engaging games using Unity and Unreal Engine.',
      image: 'https://images.unsplash.com/photo-1556438064-2d7646166914',
      color: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)'
    },
    {
      title: 'Mobile Development',
      description: 'Build apps for iOS and Android platforms.',
      image: 'https://images.unsplash.com/photo-1596742578443-7682ef5251cd',
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      title: 'Blockchain Technology',
      description: 'Learn about cryptocurrencies and decentralized applications.',
      image: 'https://images.unsplash.com/photo-1639322537228-f710d846310a',
      color: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)'
    },
    {
      title: 'DevOps',
      description: 'Integrate development and operations for better software delivery.',
      image: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb',
      color: 'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)'
    },
    {
      title: 'Augmented Reality',
      description: 'Create immersive experiences with AR technology.',
      image: 'https://images.unsplash.com/photo-1595113316349-9fa4eb24f884',
      color: 'linear-gradient(135deg, #c471f5 0%, #fa71cd 100%)'
    },
    {
      title: 'Virtual Reality',
      description: 'Explore the world of VR and create your own applications.',
      image: 'https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac',
      color: 'linear-gradient(135deg, #7028e4 0%, #e5b2ca 100%)'
    },
    {
      title: 'Internet of Things',
      description: 'Connect devices and create smart solutions.',
      image: 'https://images.unsplash.com/photo-1518770660439-4636190af475',
      color: 'linear-gradient(135deg, #0fd850 0%, #f9f047 100%)'
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
                <div className="d-flex gap-3">
                  <button className="btn btn-light btn-lg px-4 py-2" style={{ 
                    boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                    transition: 'all 0.3s ease'
                  }}>
                    <FaRocket className="me-2" /> Explore Courses
                  </button>
                  <button className="btn btn-outline-light btn-lg px-4 py-2" style={{ 
                    transition: 'all 0.3s ease'
                  }}>
                    <FaLaptopCode className="me-2" /> Start Creating
                  </button>
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

      {/* Course Section with improved cards */}
      <div className="course-section py-5" style={{ background: '#f8f9fa' }}>
        <div className="container">
          <div className="section-heading text-center mb-5">
            <FaBookOpen size={40} className="text-primary mb-3" />
            <h2 className="display-5 fw-bold">Explore Our Courses</h2>
            <div className="title-underline mx-auto mb-4" style={{
              width: '80px',
              height: '4px',
              background: 'linear-gradient(to right, #6a11cb, #2575fc)'
            }}></div>
            <p className="lead text-muted">
              Discover a wide range of courses designed to help you learn and grow.
              Whether you're a beginner or an expert, we have something for everyone.
            </p>
          </div>
          
          <div className="row g-4">
            {courses.map((course, index) => (
              <div className="col-12 col-sm-6 col-md-4 col-lg-3" key={index}>
                <div className="card h-100 border-0 shadow-sm" style={{ 
                  borderRadius: '12px', 
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  overflow: 'hidden'
                }}>
                  <div style={{ height: '180px', overflow: 'hidden' }}>
                    <div style={{ 
                      height: '100%', 
                      background: course.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <h5 className="text-white text-center px-3">{course.title}</h5>
                    </div>
                  </div>
                  <div className="card-body">
                    <p className="card-text">{course.description}</p>
                    <a href="#" className="btn btn-sm btn-primary w-100" style={{
                      borderRadius: '6px',
                      background: course.color,
                      border: 'none'
                    }}>Learn More</a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

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
=======

const Home = () => {
return (
  <>
<div className="home-wrapper">
<main className="home-content">
<h1 className="home-title">Welcome to STUDYHUB</h1>
<p className="home-description">
Your ultimate platform for online learning and content creation.
Join us to learn from the best courses or create your own educational content.
</p>
<div className="home-buttons">
<button className="btn explore-btn">Explore Courses</button>
<button className="btn create-btn">Start Creating</button>
</div>

</main>

  <header className="home-header">
    <img
      src="/main image.png"
      alt="StudyHub Logo"
      className="home-logo"
    />
  </header>
  
</div>
<div className="container-fluid mt-5 px-5">

  <h1 className="text-center mb-5">Explore Our Courses</h1>
  <p className="text-center mb-4 ">
    Discover a wide range of courses designed to help you learn and grow.
    Whether you're a beginner or an expert, we have something for everyone.
  </p>
  <div className="row gx-4 gy-4 justify-content-start">

    {[
      {
        title: 'Artificial Intelligence',
        description: 'Learn about machine learning, neural networks, and more.',
        image: 'https://via.placeholder.com/286x180',
      },
      {
        title: 'Web Development',
        description: 'Master HTML, CSS, JavaScript, and modern frameworks.',
        image: 'https://via.placeholder.com/286x180',
      },
      {
        title: 'Cyber Security',
        description: 'Understand network security and ethical hacking.',
        image: 'https://via.placeholder.com/286x180',
      },
      {
        title: 'Data Science',
        description: 'Analyze data and build predictive models with Python.',
        image: 'https://via.placeholder.com/286x180',
      },
      {
        title: 'Cloud Computing',
        description: 'Explore cloud services and infrastructure.',
        image: 'https://via.placeholder.com/286x180',
      },
      {
        title: 'Game Development',
        description: 'Create engaging games using Unity and Unreal Engine.',
        image: 'https://via.placeholder.com/286x180',
      },
      {
        title: 'Mobile Development',
        description: 'Build apps for iOS and Android platforms.',
        image: 'https://via.placeholder.com/286x180',
      },
      {
        title: 'Blockchain Technology',
        description: 'Learn about cryptocurrencies and decentralized applications.',
        image: 'https://via.placeholder.com/286x180',
      },
      {
        title: 'DevOps',
        description: 'Integrate development and operations for better software delivery.',
        image: 'https://via.placeholder.com/286x180',
      },
      {
        title: 'Augmented Reality',
        description: 'Create immersive experiences with AR technology.',
        image: 'https://via.placeholder.com/286x180',
      },
      {
        title: 'Virtual Reality',
        description: 'Explore the world of VR and create your own applications.',
        image: 'https://via.placeholder.com/286x180',
      },
      {
        title: 'Internet of Things',
        description: 'Connect devices and create smart solutions.',
        image: 'https://via.placeholder.com/286x180',
      },
      {
        title: 'Software Engineering',
        description: 'Learn software development methodologies and best practices.',
        image: 'https://via.placeholder.com/286x180',
      },

    ].map((course, index) => (
      <div className="col-12 col-sm-6 col-md-4 col-lg-3" key={index}>
        <div className="card h-100">
          <img src={course.image} className="card-img-top" alt={course.title} />
          <div className="card-body">
            <h5 className="card-title">{course.title}</h5>
            <p className="card-text">{course.description}</p>
            <a href="#" className="btn btn-primary">Learn More</a>
          </div>
        </div>
      </div>
    ))}
  </div>
</div>

</>
);
};

export default Home;