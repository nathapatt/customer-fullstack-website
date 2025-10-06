import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { useAppContext } from '../context/AppContext';
import { useSession } from '../context/SessionContext';

const QRScanPage = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { dispatch } = useAppContext();
  const { setSession } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tableInfo, setTableInfo] = useState<any>(null);
  const [sessionMessage, setSessionMessage] = useState<string>('');

  useEffect(() => {
    const createSession = async () => {
      if (!token) {
        setError('Invalid QR code');
        setLoading(false);
        return;
      }

      try {
        // Clear any previous session first
        localStorage.removeItem('sessionId');
        localStorage.removeItem('sessionData');

        // Create or join session from QR token
        const session = await apiService.createSession(token);

        // Store session info in localStorage and update context
        setSession(session.id, session);

        // Set the session message for user feedback
        setSessionMessage(session.message || 'Session created successfully');

        // Get table info for display
        const tables = await apiService.getTables();
        const table = tables.find(t => t.qrCodeToken === token);

        if (table) {
          setTableInfo(table);

          // Update app context with table info
          dispatch({
            type: 'SET_TABLE_INFO',
            payload: {
              number: `A-${table.tableNumber}`,
              restaurant: "ครัวคุณยาย",
              capacity: table.capacity,
              shareUrl: `${window.location.origin}/scan/${token}`
            }
          });
        }

        setLoading(false);

        // Auto redirect to menu after 2 seconds
        setTimeout(() => {
          navigate('/');
        }, 2000);

      } catch (err) {
        console.error('Failed to create session:', err);
        setError('Failed to join table. Please try scanning again.');
        setLoading(false);
      }
    };

    createSession();
  }, [token, navigate, dispatch, setSession]);

  if (loading) {
    return (
      <div className="max-w-md mx-auto bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">กำลังเข้าร่วมโต๊ะ</h2>
          <p className="text-gray-600">กรุณารอสักครู่...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">เกิดข้อผิดพลาด</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            กลับสู่หน้าหลัก
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen flex items-center justify-center">
      <div className="text-center p-6">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          {sessionMessage.includes('Joined') ? 'เข้าร่วมโต๊ะสำเร็จ!' : 'เข้าร่วมโต๊ะสำเร็จ!'}
        </h2>

        {sessionMessage && (
          <div className={`rounded-lg p-3 mb-4 ${
            sessionMessage.includes('Joined')
              ? 'bg-blue-50 border border-blue-200'
              : sessionMessage.includes('expired')
              ? 'bg-orange-50 border border-orange-200'
              : 'bg-green-50 border border-green-200'
          }`}>
            <p className={`text-sm font-medium ${
              sessionMessage.includes('Joined')
                ? 'text-blue-700'
                : sessionMessage.includes('expired')
                ? 'text-orange-700'
                : 'text-green-700'
            }`}>
              {sessionMessage.includes('Joined') && '👥 คุณได้เข้าร่วมโต๊ะที่มีผู้อื่นสั่งอาหารอยู่แล้ว'}
              {sessionMessage.includes('expired') && '⏰ เซสชันเก่าหมดอายุแล้ว สร้างเซสชันใหม่'}
              {sessionMessage.includes('New session created') && '✨ สร้างเซสชันใหม่สำเร็จ'}
            </p>
          </div>
        )}

        {tableInfo && (
          <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-2">ข้อมูลโต๊ะ</h3>
            <p className="text-gray-600">โต๊ะหมายเลข: A-{tableInfo.tableNumber}</p>
            <p className="text-gray-600">จำนวนที่นั่ง: {tableInfo.capacity} ที่</p>
          </div>
        )}

        <p className="text-gray-600 mb-4">กำลังเปลี่ยนไปหน้าเมนู...</p>

        <div className="flex gap-3">
          <button
            onClick={() => navigate('/')}
            className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white py-3 rounded-lg font-semibold transition-colors"
          >
            ดูเมนู
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRScanPage;