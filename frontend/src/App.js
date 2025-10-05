import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Team from './components/Team';
import Signup from './components/Signup';
import Login from './components/Login';
import StorageManager from './components/StorageManager';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <main className="home-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/team" element={<Team />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/storage" element={<StorageManager />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;