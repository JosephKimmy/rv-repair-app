import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import jsPDF from 'jspdf';

function TicketView({ match }) {
  const [ticket, setTicket] = useState({
    id: '',
    customer_name: '',
    parts_total: 0,
    labor_total: 0,
    grand_total: 0,
    remaining: 0,
  });
  const [ahValue, setAhValue] = useState(0);
  const canvasRef = useRef(null);

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text('Ticket PDF', 10, 10);
    doc.save('ticket.pdf');
  };

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

  return (
    <div className="p-4">
      <div className="glassmorphism-card p-6">
        <h1>Ticket #{ticket.id}</h1>

        {/* Customer/RV info */}
        <div className="flex overflow-x-auto space-x-2">
          {['Generator', 'Inverter'].map((item) => (
            <button
              key={item}
              className="repair-btn"
              onClick={() => {
                /* accordion */
              }}
            >
              {item}
            </button>
          ))}
        </div>

        {/* Parts/Labor tables */}
        <table className="w-full">
          <tbody>{/* Dynamic rows */}</tbody>
        </table>

        <div className="text-right">
          Parts: ${ticket.parts_total}
          <br />
          Tax: ${ticket.parts_total * 0.083}
          <br />
          Labor: ${ticket.labor_total}
          <br />
          Grand: ${ticket.grand_total}
          <br />
          Remaining: ${ticket.remaining}
        </div>

        <input
          type="range"
          min="-10"
          max="10"
          value={ahValue}
          onChange={(e) => setAhValue(e.target.value)}
          className="ah-bar"
        />

        {/* Signature */}
        <canvas
          ref={canvasRef}
          className="signature border border-cyan-500 rounded w-full h-32 bg-black mt-4"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          style={{ touchAction: 'none' }}
        />

        <button onClick={generatePDF} className="gradient-btn">
          Print PDF
        </button>
      </div>
    </div>
  );
}

export default TicketView;