import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import jsPDF from 'jspdf';

function TicketView({ match }) {
  const [ticket, setTicket] = useState({
    id: '',
    customer_name: '',
    rv_year: '',
    make: '',
    model: '',
    vin: '',
    lot: '',
    gate: '',
    miles: '',
    parts_total: 0,
    labor_total: 0,
    grand_total: 0,
    remaining: 0,
  });
  const [ahValue, setAhValue] = useState(0);
  const canvasRef = useRef(null);

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text(`Ticket #${ticket.id}`, 10, 10);
    doc.text(`Customer: ${ticket.customer_name}`, 10, 20);
    doc.text(`Parts: $${ticket.parts_total}`, 10, 30);
    doc.text(`Tax: $${(ticket.parts_total * 0.083).toFixed(2)}`, 10, 40);
    doc.text(`Labor: $${ticket.labor_total}`, 10, 50);
    doc.text(`Grand Total: $${ticket.grand_total}`, 10, 60);
    doc.text(`Remaining: $${ticket.remaining}`, 10, 70);
    doc.save(`ticket-${ticket.id}.pdf`);
  };

  const repairItems = ['Generator', 'Inverter', 'A/C', 'Fridge', 'Water Heater', 'Battery'];

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
        <h1 className="text-2xl font-bold mb-4">Ticket #{ticket.id}</h1>

        {/* Customer/RV info */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p><strong>Customer:</strong> {ticket.customer_name}</p>
            <p><strong>RV:</strong> {ticket.rv_year} {ticket.make} {ticket.model}</p>
            <p><strong>VIN:</strong> {ticket.vin}</p>
          </div>
          <div>
            <p><strong>Location:</strong> Lot {ticket.lot}, Gate {ticket.gate}</p>
            <p><strong>Miles:</strong> {ticket.miles}</p>
          </div>
        </div>

        {/* Repair buttons */}
        <div className="flex overflow-x-auto space-x-2 mb-6">
          {repairItems.map((item) => (
            <button
              key={item}
              className="repair-btn px-4 py-2"
              onClick={() => {}}
            >
              {item}
            </button>
          ))}
        </div>

        {/* Parts/Labor tables */}
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Parts & Labor</h3>
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Item</th>
                <th className="text-right p-2">Qty</th>
                <th className="text-right p-2">Price</th>
                <th className="text-right p-2">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan="4" className="text-center p-4 text-gray-500">
                  No items added yet
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="text-right mb-6">
          <p>Parts: ${ticket.parts_total}</p>
          <p>Tax: ${(ticket.parts_total * 0.083).toFixed(2)}</p>
          <p>Labor: ${ticket.labor_total}</p>
          <p className="font-bold">Grand Total: ${ticket.grand_total}</p>
          <p>Remaining: ${ticket.remaining}</p>
        </div>

        {/* AH slider */}
        <div className="mb-6">
          <label className="block mb-2">AH Adjustment: {ahValue}</label>
          <input
            type="range"
            min="-10"
            max="10"
            value={ahValue}
            onChange={(e) => setAhValue(e.target.value)}
            className="ah-bar w-full"
          />
        </div>

        {/* Signature */}
        <div className="mb-6">
          <label className="block mb-2">Customer Signature:</label>
          <canvas
            ref={canvasRef}
            className="signature border border-cyan-500 rounded w-full h-32 bg-black"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            style={{ touchAction: 'none' }}
          />
        </div>

        {/* Print PDF */}
        <button
          onClick={generatePDF}
          className="gradient-btn w-full py-3 text-lg"
        >
          Print PDF
        </button>
      </div>
    </div>
  );
}

export default TicketView;