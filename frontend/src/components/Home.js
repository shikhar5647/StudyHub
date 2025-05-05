import React from 'react';
import '../App.css';


const Home = () => {
  return (
    <div className="home-container">
      <header className="home-header">
        <img
          src="/studyhub_logo.png"
          alt="StudyHub Logo"
          className="home-logo"
        />
      </header>
      <main className="home-content">
        <h1 className="home-title">Welcome to StudyHub</h1>
        <p className="home-description">
          Your ultimate platform for online learning and content creation.
          Join us to learn from the best courses or create your own educational
          content.
        </p>
        <div className="home-buttons">
          <button className="btn explore-btn">Explore Courses</button>
          <button className="btn create-btn">Start Creating</button>
        </div>
      </main>
    </div>
  );
};

export default Home;
