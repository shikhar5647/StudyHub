import React, { useState, useEffect } from 'react';
import { User, BookOpen, LogOut, ChevronDown } from 'lucide-react';

const Navbar = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null); // 'student' or 'creator'
  const [profileDropdown, setProfileDropdown] = useState(false);

  useEffect(() => {
    // Check if user is logged in (check for JWT token in localStorage)
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      // You would need to decode JWT to get role or fetch user data
      // For demo purposes, let's assume we have the role stored
      const storedRole = localStorage.getItem('userRole');
      setUserRole(storedRole || 'student');
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    setIsAuthenticated(false);
    setUserRole(null);
    setProfileDropdown(false);
    // Use regular navigation for now
    window.location.href = '/login';
  };

  return (
    <nav className="bg-indigo-700 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex-shrink-0 flex items-center">
            <a href="/" className="flex items-center">
              <BookOpen className="h-8 w-8 text-white" />
              <span className="ml-2 text-xl font-bold text-white">StudyHub</span>
            </a>
          </div>
          
          {/* Desktop Navigation Links */}
          <div className="flex items-center">
            <div className="flex items-center space-x-4">
              <a href="/" className="text-white hover:bg-indigo-600 px-3 py-2 rounded-md font-medium">
                Home
              </a>
              <a href="/courses" className="text-white hover:bg-indigo-600 px-3 py-2 rounded-md font-medium">
                Courses
              </a>
              {userRole === 'creator' && (
                <a href="/creator/dashboard" className="text-white hover:bg-indigo-600 px-3 py-2 rounded-md font-medium">
                  Creator Dashboard
                </a>
              )}
              <a href="/about" className="text-white hover:bg-indigo-600 px-3 py-2 rounded-md font-medium">
                About
              </a>
            </div>
          </div>
          
          {/* Auth Buttons or Profile */}
          <div>
            {isAuthenticated ? (
              <div className="relative">
                <button 
                  onClick={() => setProfileDropdown(!profileDropdown)}
                  className="flex items-center text-white bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-md"
                >
                  <User className="h-5 w-5 mr-2" />
                  <span>Profile</span>
                  <ChevronDown className="h-4 w-4 ml-1" />
                </button>
                
                {/* Profile Dropdown */}
                {profileDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                    <a 
                      href="/profile" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setProfileDropdown(false)}
                    >
                      My Profile
                    </a>
                    <a 
                      href="/my-courses" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setProfileDropdown(false)}
                    >
                      My Courses
                    </a>
                    <button 
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex space-x-2">
                <a href="/login" className="text-white hover:bg-indigo-600 px-3 py-2 rounded-md font-medium">
                  Login
                </a>
                <a href="/signup" className="bg-white text-indigo-700 hover:bg-gray-100 px-3 py-2 rounded-md font-medium">
                  Sign Up
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;