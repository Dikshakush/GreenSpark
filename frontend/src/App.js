import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginScreen from './components/LoginScreen';
import RegisterScreen from './components/RegisterScreen';
import ProfileScreen from './components/ProfileScreen';
import DashBoard from './components/DashBoard/DashBoard.jsx';
import ForgotPasswordScreen from './components/screens/ForgotPasswordScreen';
import ResetPasswordScreen from './components/screens/ResetPasswordScreen';
import VerifyOTPScreen from './components/screens/VerifyOTPScreen';
import SetNewPasswordScreen from './components/screens/SetNewPasswordScreen';
import AboutScreen from './components/AboutScreen'; 
import Header from './components/Header';
import HomeScreen from './components/HomeScreen'; 
import EcoJourneyScreen from './components/EcoJourneyScreen/EcoJourneyScreen';
import CommunityScreen from "./screens/CommunityScreen";
import NewPostScreen from "./screens/NewPostScreen";

// Inside <Routes>




function App() {
  return (
    <Router>
      {/* Header is outside the routes so it's visible on every page */}
      <Header />

      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/register" element={<RegisterScreen />} />
        <Route path="/profile" element={<ProfileScreen />} />
        <Route path="/dashBoard" element={<DashBoard />} />
        <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
        <Route path="/reset-password/:token" element={<ResetPasswordScreen />} />
        <Route path="/verify-otp" element={<VerifyOTPScreen />} />
        <Route path="/reset-password" element={<SetNewPasswordScreen />} />
        <Route path="/about" element={<AboutScreen />} />
        <Route path="/ecojourney" element={<EcoJourneyScreen />} />
        <Route path="/community" element={<CommunityScreen />} />
        <Route path="/new-post" element={<NewPostScreen />} />

        <Route path="*" element={<h2>404 - Page not found</h2>} />
        
      </Routes>
    </Router>
  );
}

export default App;
