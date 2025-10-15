import { Navigate } from 'react-router-dom';
import { useSession } from '../context/SessionContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { hasValidSession, loading } = useSession(); // 1. ดึงค่า loading มาจาก Context

  if (loading) {
    // 2. ถ้ากำลังโหลด ให้แสดงหน้า loading ชั่วคราว
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
    // 3. ถ้าโหลดเสร็จแล้ว และไม่มี session ให้ redirect
    return <Navigate to="/session-required" replace />;
  }

  // 4. ถ้าโหลดเสร็จแล้ว และมี session ให้แสดงหน้าเว็บตามปกติ
  return <>{children}</>;
};

export default ProtectedRoute;