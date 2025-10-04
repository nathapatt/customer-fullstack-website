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
      const response = await fetch(`http://localhost:3000/tables/${tableId}/qr`);
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
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading tables...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">QR Code Generator for Tables</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Table Selection */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Table</h2>
            <div className="space-y-3">
              {tables.map((table) => (
                <div
                  key={table.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => generateQRCode(table.id)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">Table A-{table.tableNumber}</h3>
                      <p className="text-sm text-gray-600">Capacity: {table.capacity} seats</p>
                      <p className="text-xs text-gray-500 font-mono">{table.qrCodeToken}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        generateQRCode(table.id);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
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
                  <div className="qr-code bg-white p-4 border-2 border-gray-300 rounded-lg inline-block">
                    <img
                      src={qrCodeDataURL}
                      alt={`QR Code for Table ${selectedTable.tableNumber}`}
                      className="w-64 h-64"
                    />
                    <div className="text-center mt-2 text-xs text-gray-600">
                      Table A-{selectedTable?.tableNumber}
                    </div>
                  </div>
                ) : (
                  <div className="w-64 h-64 bg-gray-100 flex items-center justify-center rounded-lg">
                    <div className="text-gray-500">Generating QR Code...</div>
                  </div>
                )}

                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Table Information</h3>
                  <p className="text-sm text-gray-600">Table: A-{selectedTable.tableNumber}</p>
                  <p className="text-sm text-gray-600">Capacity: {selectedTable.capacity} seats</p>
                  <p className="text-xs text-gray-500 font-mono break-all mt-2">{selectedTable.url}</p>
                </div>

                <div className="mt-4 space-y-2">
                  <button
                    onClick={() => {
                      window.open(selectedTable.url, '_blank');
                    }}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition-colors"
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
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors"
                    disabled={!qrCodeDataURL}
                  >
                    Download QR Code
                  </button>
                  <button
                    onClick={() => {
                      window.print();
                    }}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg transition-colors"
                  >
                    Print QR Code
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(selectedTable.url);
                      alert('URL copied to clipboard!');
                    }}
                    className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg transition-colors"
                  >
                    Copy URL
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-12">
                <p>Select a table to generate its QR code</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">How it works:</h3>
          <ol className="text-sm text-blue-800 space-y-1">
            <li>1. Print the QR code and place it on the table</li>
            <li>2. Customers scan the QR code to join the table session</li>
            <li>3. Multiple customers can scan the same QR code to share orders</li>
            <li>4. Orders are linked to the table and session</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default AdminQRGenerator;