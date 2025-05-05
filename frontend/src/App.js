import React from 'react';
import Navbar from './components/Navbar';
import './App.css';

function App() {
  return (
    <div className="App">
      <Navbar />
      <main className="content">
        <Home />
      </main>
    </div>
  );
}

// Home component
const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
      <img 
        src="/studyhub_logo.png" 
        alt="StudyHub Logo" 
        className="w-64 h-auto mb-8" 
      />
      <h1 className="text-4xl font-bold text-indigo-700 mb-4">Welcome to StudyHub</h1>
      <p className="text-xl text-gray-700 max-w-2xl text-center mb-8">
        Your ultimate platform for online learning and content creation.
        Join us to learn from the best courses or create your own educational content.
      </p>
      <div className="flex space-x-4">
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg">
          Explore Courses
        </button>
        <button className="border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-100 font-bold py-2 px-6 rounded-lg">
          Start Creating
        </button>
      </div>
    </div>
  );
};

export default App;