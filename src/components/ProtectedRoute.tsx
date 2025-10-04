import { Navigate } from 'react-router-dom';
import { useSession } from '../context/SessionContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { hasValidSession } = useSession();

  if (!hasValidSession) {
    return <Navigate to="/session-required" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;