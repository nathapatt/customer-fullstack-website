import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import QRCode from 'qrcode';

interface TableQRData {
  tableId: number;
  tableNumber: number;
  qrCodeToken: string;
  url: string;
  capacity: number;
}

const AdminQRGenerator = () => {
  const [tables, setTables] = useState<any[]>([]);
  const [selectedTable, setSelectedTable] = useState<TableQRData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTables = async () => {
      try {
        const tablesData = await apiService.getTables();
        setTables(tablesData);
      } catch (error) {
        console.error('Failed to fetch tables:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTables();
  }, []);

  const generateQRCode = async (tableId: number) => {
    try {
      const apiBaseUrl = import.meta.env.VITE_API_PROXY_PATH || '/api';
      const response = await fetch(`${apiBaseUrl}/tables/${tableId}/qr`);
      const qrData = await response.json();
      setSelectedTable(qrData);
    } catch (error) {
      console.error('Failed to generate QR code:', error);
    }
  };

  const [qrCodeDataURL, setQrCodeDataURL] = useState<string>('');

  const generateQRCodeImage = async (url: string) => {
    try {
      const qrDataURL = await QRCode.toDataURL(url, {
        width: 256,
        margin: 2,
        color: { dark: '#000000', light: '#FFFFFF' }
      });
      setQrCodeDataURL(qrDataURL);
    } catch (error) {
      console.error('Failed to generate QR code:', error);
    }
  };

  useEffect(() => {
    if (selectedTable?.url) {
      generateQRCodeImage(selectedTable.url);
    }
  }, [selectedTable]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-400 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tables...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Removed outside border; soft card feel */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">QR Code Generator for Tables</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Table Selection */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Table</h2>
            <div className="space-y-3">
              {tables.map((table) => (
                <div
                  key={table.id}
                  onClick={() => generateQRCode(table.id)}
                  className="rounded-xl p-4 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-all shadow-sm"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium text-gray-900">Table A-{table.tableNumber}</h3>
                      <p className="text-sm text-gray-600">Capacity: {table.capacity} seats</p>
                      <p className="text-xs text-gray-500 font-mono">{table.qrCodeToken}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        generateQRCode(table.id);
                      }}
                      className="px-4 py-2 rounded-full text-sm font-medium text-white bg-sky-400 hover:bg-sky-500 active:scale-[.98] transition"
                    >
                      Generate QR
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* QR Code Display */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">QR Code</h2>
            {selectedTable ? (
              <div className="text-center">
                {qrCodeDataURL ? (
                  <div className="inline-block bg-white p-4 rounded-2xl shadow">
                    <img
                      src={qrCodeDataURL}
                      alt={`QR Code for Table ${selectedTable.tableNumber}`}
                      className="w-64 h-64 rounded-lg"
                    />
                    <div className="text-center mt-2 text-xs text-gray-600">
                      Table A-{selectedTable?.tableNumber}
                    </div>
                  </div>
                ) : (
                  <div className="w-64 h-64 bg-gray-100 flex items-center justify-center rounded-2xl shadow mx-auto">
                    <div className="text-gray-500">Generating QR Code...</div>
                  </div>
                )}

                <div className="mt-4 p-4 bg-gray-50 rounded-2xl">
                  <h3 className="font-medium text-gray-900 mb-2">Table Information</h3>
                  <p className="text-sm text-gray-600">Table: A-{selectedTable.tableNumber}</p>
                  <p className="text-sm text-gray-600">Capacity: {selectedTable.capacity} seats</p>
                  <p className="text-xs text-gray-500 font-mono break-all mt-2">{selectedTable.url}</p>
                </div>

                {/* Cute color buttons */}
                <div className="mt-4 space-y-2">
                  <button
                    onClick={() => window.open(selectedTable.url, '_blank')}
                    className="w-full py-2 rounded-full font-medium text-white bg-emerald-400 hover:bg-emerald-500 transition"
                  >
                    Test QR Code
                  </button>

                  <button
                    onClick={() => {
                      const link = document.createElement('a');
                      link.download = `table-${selectedTable.tableNumber}-qr.png`;
                      link.href = qrCodeDataURL;
                      link.click();
                    }}
                    disabled={!qrCodeDataURL}
                    className={`w-full py-2 rounded-full font-medium text-white transition ${
                      qrCodeDataURL
                        ? 'bg-sky-400 hover:bg-sky-500'
                        : 'bg-sky-300 cursor-not-allowed'
                    }`}
                  >
                    Download QR Code
                  </button>

                  <button
                    onClick={() => window.print()}
                    className="w-full py-2 rounded-full font-medium text-white bg-violet-400 hover:bg-violet-500 transition"
                  >
                    Print QR Code
                  </button>

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(selectedTable.url);
                      // keep it simple; no alert – soft feedback with opacity pulse
                      const el = document.getElementById('copy-pulse');
                      if (el) {
                        el.classList.remove('opacity-0');
                        el.classList.add('opacity-100');
                        setTimeout(() => {
                          el.classList.add('opacity-0');
                        }, 1200);
                      }
                    }}
                    className="w-full py-2 rounded-full font-medium text-white bg-rose-400 hover:bg-rose-500 transition"
                  >
                    Copy URL
                  </button>

                  {/* tiny non-intrusive copied hint */}
                  <div
                    id="copy-pulse"
                    className="opacity-0 transition-opacity text-xs text-gray-500 text-center"
                  >
                    Copied!
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-12">
                <p>Select a table to generate its QR code</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminQRGenerator;
