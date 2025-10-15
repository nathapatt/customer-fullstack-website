import { Navigate } from 'react-router-dom';
import { useSession } from '../context/SessionContext';
import { useEffect, useRef } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { hasValidSession, loading, validateWithBackend } = useSession();
  const validationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Periodic validation of session with backend
  useEffect(() => {
    if (!hasValidSession) return;

    // Set up periodic validation every 2 minutes (not immediately to avoid loop)
    validationIntervalRef.current = setInterval(() => {
      validateWithBackend();
    }, 2 * 60 * 1000); // 2 minutes

    return () => {
      if (validationIntervalRef.current) {
        clearInterval(validationIntervalRef.current);
      }
    };
  }, [hasValidSession]); // Remove validateWithBackend from dependencies

  if (loading) {
    return (
      <div className="max-w-md mx-auto bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading session...</p>
        </div>
      </div>
    );
  }

  if (!hasValidSession) {
    return <Navigate to="/session-required" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;