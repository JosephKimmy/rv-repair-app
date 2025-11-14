import React, { useRef } from 'react';

function CustomerPortal({ match }) {
  const canvasRef = useRef(null);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
  };

  const draw = (e) => {
    if (e.buttons !== 1) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctx.strokeStyle = 'cyan';
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  const handleSubmit = () => {
    // TODO: Save signature + submit
    alert('Signature submitted!');
  };

  return (
    <div className="p-4">
      <div className="glassmorphism-card p-6">
        <h1 className="text-2xl font-bold mb-6">Customer Portal</h1>

        {/* Status Bar */}
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Ticket Status</h3>
          <div className="bg-gray-800 rounded-full h-4 overflow-hidden">
            <div className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full w-3/4"></div>
          </div>
          <p className="text-sm mt-1">In Progress - Repair Phase</p>
        </div>

        {/* Balance */}
        <div className="mb-6 p-4 bg-black bg-opacity-50 rounded-lg">
          <h3 className="font-semibold mb-2">Balance Due</h3>
          <p className="text-3xl font-bold text-cyan-400">$1,247.50</p>
          <button className="gradient-btn mt-3 w-full">Pay Now</button>
        </div>

        {/* Photos */}
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Repair Photos</h3>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-gray-800 h-24 rounded-lg flex items-center justify-center">
              <span className="text-gray-500">Photo 1</span>
            </div>
            <div className="bg-gray-800 h-24 rounded-lg flex items-center justify-center">
              <span className="text-gray-500">Photo 2</span>
            </div>
            <div className="bg-gray-800 h-24 rounded-lg flex items-center justify-center">
              <span className="text-gray-500">Photo 3</span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Messages from Tech</h3>
          <div className="bg-black bg-opacity-50 p-3 rounded-lg mb-2">
            <p className="text-sm">Compressor replaced. Testing now.</p>
            <p className="text-xs text-gray-400">Joseph - 2:15 PM</p>
          </div>
        </div>

        {/* RV List */}
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Your RVs</h3>
          <div className="space-y-2">
            <div className="bg-black bg-opacity-50 p-3 rounded-lg">
              <p className="font-medium">2019 Winnebago Vista</p>
              <p className="text-sm text-gray-400">VIN: 1F65F5DY9K0A12345</p>
            </div>
          </div>
        </div>

        {/* Signature */}
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Approve & Sign</h3>
          <canvas
            ref={canvasRef}
            className="signature border border-cyan-500 rounded w-full h-32 bg-black"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            style={{ touchAction: 'none' }}
          />
          <button
            onClick={handleSubmit}
            className="gradient-btn w-full mt-3 py-3 text-lg"
          >
            Submit Signature
          </button>
        </div>
      </div>
    </div>
  );
}

export default CustomerPortal;