import React from 'react';
import Navbar from './components/Navbar';
import Home from './components/Home';
import './App.css';

function App() {
  return (
    <div className="App">
      <Navbar />
      <main className="home-content">
        <Home />
      </main>
    </div>
  );
}

export default App;
