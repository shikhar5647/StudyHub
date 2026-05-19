import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Team from './components/Team';
import Signup from './components/Signup';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import AuthCallback from './components/AuthCallback';
import StorageManager from './components/StorageManager';
import CoursesList from './components/CoursesList';
import CourseDetail from './components/CourseDetail';
import Profile from './components/Profile';
import InstructorHub from './components/InstructorHub';
import AdminHub from './components/AdminHub';
import CourseEditor from './components/instructor/CourseEditor';
import CourseLearn from './components/CourseLearn';
import ProtectedRoute from './components/ProtectedRoute';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import VerifyEmail from './components/VerifyEmail';
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
            <Route path="/courses" element={<CoursesList />} />
            <Route path="/courses/:slug" element={<CourseDetail />} />
            <Route
              path="/courses/:slug/learn"
              element={
                <ProtectedRoute>
                  <CourseLearn />
                </ProtectedRoute>
              }
            />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/instructor"
              element={
                <ProtectedRoute roles={['instructor', 'admin']}>
                  <InstructorHub />
                </ProtectedRoute>
              }
            />
            <Route
              path="/instructor/courses/new"
              element={
                <ProtectedRoute roles={['instructor', 'admin']}>
                  <CourseEditor />
                </ProtectedRoute>
              }
            />
            <Route
              path="/instructor/courses/:slug/edit"
              element={
                <ProtectedRoute roles={['instructor', 'admin']}>
                  <CourseEditor />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute roles={['admin']}>
                  <AdminHub />
                </ProtectedRoute>
              }
            />
            <Route
              path="/storage"
              element={
                <ProtectedRoute roles={['instructor', 'admin']}>
                  <StorageManager />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </Router>
  );
}

export default App;
