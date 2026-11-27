import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, requireBoard = false, setup = false }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-amber-400">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.mustChangePassword && !setup) {
    return <Navigate to="/setup-profile" replace />;
  }

  if (!user.mustChangePassword && setup) {
    return <Navigate to={user.isBoardMember ? '/board' : '/member'} replace />;
  }

  if (requireBoard && !user.isBoardMember) {
    return <Navigate to="/member" replace />;
  }

  return children;
}
