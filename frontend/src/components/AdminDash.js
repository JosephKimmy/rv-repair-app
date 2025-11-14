import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AdminDash() {
  const [revenue, setRevenue] = useState(0);
  const [pendingInsurance, setPendingInsurance] = useState(0);
  const [lowStock, setLowStock] = useState([]);
  const [taxRate, setTaxRate] = useState(8.3);
  const [blacklist, setBlacklist] = useState([]);

  useEffect(() => {
    // Fetch data
    axios.get('/admin/dash', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).then(res => {
      setRevenue(res.data.revenue || 0);
      setPendingInsurance(res.data.pending_insurance || 0);
      setLowStock(res.data.low_stock || []);
      setBlacklist(res.data.blacklist || []);
    });
  }, []);

  return (
    <div className="p-4">
      <div className="glassmorphism-card p-6">
        <h2 className="text-2xl font-bold mb-6">Admin Dashboard</h2>

        {/* Revenue */}
        <div className="mb-6 p-4 bg-black bg-opacity-50 rounded-lg">
          <h3 className="font-semibold mb-2">Revenue (7 Days)</h3>
          <p className="text-3xl font-bold text-cyan-400">${revenue.toFixed(2)}</p>
        </div>

        {/* Pending Insurance */}
        <div className="mb-6 p-4 bg-yellow-900 bg-opacity-50 rounded-lg">
          <h3 className="font-semibold mb-2">Pending Insurance Claims</h3>
          <p className="text-2xl font-bold">{pendingInsurance}</p>
        </div>

        {/* Low Stock */}
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Low Stock Alerts</h3>
          {lowStock.length === 0 ? (
            <p className="text-green-400">All items in stock</p>
          ) : (
            <div className="space-y-2">
              {lowStock.map(item => (
                <div key={item.id} className="bg-red-900 bg-opacity-50 p-3 rounded">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm">Qty: {item.qty} (Reorder)</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tax Rate */}
        <div className="mb-6 p-4 bg-black bg-opacity-50 rounded-lg">
          <h3 className="font-semibold mb-2">Tax Rate</h3>
          <div className="flex items-center space-x-4">
            <input
              type="number"
              value={taxRate}
              onChange={(e) => setTaxRate(e.target.value)}
              className="input-field w-24"
              step="0.1"
            />
            <span>%</span>
            <button className="gradient-btn text-sm px-4">Save</button>
          </div>
        </div>

        {/* Blacklist */}
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Customer Blacklist</h3>
          {blacklist.length === 0 ? (
            <p className="text-gray-400">No blacklisted customers</p>
          ) : (
            <div className="space-y-2">
              {blacklist.map(cust => (
                <div key={cust.id} className="bg-red-900 bg-opacity-50 p-3 rounded flex justify-between items-center">
                  <div>
                    <p className="font-medium">{cust.name}</p>
                    <p className="text-sm">{cust.phone}</p>
                    <p className="text-xs text-gray-300">{cust.reason}</p>
                  </div>
                  <button className="text-red-400 text-sm">Remove</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDash;