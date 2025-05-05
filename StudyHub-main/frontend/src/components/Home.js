import React from 'react';
import '../App.css';

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