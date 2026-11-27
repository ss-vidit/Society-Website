import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import OpeningAnimation from './components/OpeningAnimation';
import AmbientLights from './components/AmbientLights';
import ProtectedRoute from './components/ProtectedRoute';
import PublicLanding from './pages/PublicLanding';
import LoginPage from './pages/LoginPage';
import MemberDashboard from './pages/MemberDashboard';
import BoardDashboard from './pages/BoardDashboard';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';

function RootRedirect() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <img src="/logo.jpg" alt="Binary Boppers" className="h-16 w-16 rounded-full object-cover" />
      </div>
    );
  }

  if (!user) return <Navigate to="/home" replace />;

  const destination = user.mustChangePassword
    ? '/setup-profile'
    : user.isBoardMember ? '/board' : '/member';
  return <Navigate to={destination} replace />;
}

export default function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [introCallback, setIntroCallback] = useState(null);

  // Trigger the opening animation and run the navigation callback after it finishes
  const triggerIntro = (afterIntro) => {
    setIntroCallback(() => afterIntro);
    setShowIntro(true);
  };

  const handleIntroComplete = () => {
    setShowIntro(false);
    if (introCallback) {
      introCallback();
      setIntroCallback(null);
    }
  };

  return (
    <AuthProvider>
      {showIntro && <OpeningAnimation onComplete={handleIntroComplete} />}
      <BrowserRouter>
        <div className="site-experience">
          {!showIntro && <AmbientLights />}
          <a className="skip-link" href="#main-content">Skip to main content</a>
          <Routes>
            <Route path="/" element={<RootRedirect />} />
            <Route path="/home" element={<PublicLanding />} />
            <Route path="/login" element={<LoginPage onPlayIntro={triggerIntro} />} />
            <Route
              path="/setup-profile"
              element={
                <ProtectedRoute setup>
                  <ProfilePage setup />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/member"
              element={
                <ProtectedRoute>
                  <MemberDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/board"
              element={
                <ProtectedRoute requireBoard>
                  <BoardDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
