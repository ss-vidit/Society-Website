import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import OpeningAnimation from './components/OpeningAnimation';
import ProtectedRoute from './components/ProtectedRoute';
import EntryPortal from './pages/EntryPortal';
import PublicLanding from './pages/PublicLanding';
import LoginPage from './pages/LoginPage';
import MemberDashboard from './pages/MemberDashboard';
import BoardDashboard from './pages/BoardDashboard';
import ProfilePage from './pages/ProfilePage';

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
        <Routes>
          <Route path="/" element={<EntryPortal onPlayIntro={triggerIntro} />} />
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
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
