import { QrCode, Users, Smartphone } from 'lucide-react';

const SessionRequired = () => {
  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen flex items-center justify-center">
      <div className="text-center p-6">
        {/* QR Code Icon */}
        <div className="w-24 h-24 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <QrCode className="w-12 h-12 text-white" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          สแกน QR Code เพื่อเข้าใช้งาน
        </h1>

        <p className="text-gray-600 mb-8 leading-relaxed">
          กรุณาสแกน QR Code ที่โต๊ะของคุณเพื่อเริ่มใช้งาน
          หรือขอให้เพื่อนที่อยู่โต๊ะเดียวกันแชร์ลิงก์ให้คุณ
        </p>

        {/* Instructions */}
        <div className="space-y-4 mb-8">
          <div className="flex items-start gap-3 text-left">
            <div className="w-8 h-8 bg-cyan-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <Smartphone className="w-4 h-4 text-cyan-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">วิธีการใช้งาน</h3>
              <p className="text-sm text-gray-600">เปิดกล้องและสแกน QR Code ที่โต๊ะ</p>
            </div>
          </div>

          <div className="flex items-start gap-3 text-left">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <Users className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">สั่งร่วมกับเพื่อน</h3>
              <p className="text-sm text-gray-600">เพื่อนสามารถสแกน QR เดียวกันเพื่อสั่งร่วมกัน</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionRequired;