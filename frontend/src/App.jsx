// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import DashBoard from './components/DashBoard/DashBoard.jsx';
import Header from './components/Header';
import ForgotPasswordScreen from './components/screens/ForgotPasswordScreen';
import SetNewPasswordScreen from './components/screens/SetNewPasswordScreen';
import AboutScreen from './components/AboutScreen';
import HomeScreen from './components/HomeScreen'; 
import EcoJourneyScreen from './components/EcoJourneyScreen/EcoJourneyScreen';
import CommunityScreen from './components/EcoJourneyScreen/CommunityScreen';
import NewPostScreen from './components/EcoJourneyScreen/NewPostScreen';

import { PointsProvider } from "./context/PointsProvider";


function App() {
  return (
    <PointsProvider>
    <Router>
      {/* Header is outside the routes so it's visible on every page */}
      <Header />

      <main className="py-4 mt-5">
        <Container fluid>
          <Routes>
            
            <Route path="/" element={<HomeScreen />} />  
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/dashboard" element={<DashBoard />} />
            <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
            <Route path="/setNew-password" element={<SetNewPasswordScreen />} />S
            <Route path="/about" element={<AboutScreen />} />
            <Route path="/eco-journey" element={<EcoJourneyScreen />} />
            <Route path="/community" element={<CommunityScreen />} />
            <Route path="/new-post" element={<NewPostScreen />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Container>
      </main>
    </Router>
    </PointsProvider>
  );
}

// Simple 404 page
const NotFound = () => (
  <h2 className="text-center">404 - Page not found</h2>
);

export default App;
