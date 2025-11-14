import React, { useState, useEffect } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';

const columns = ['intake', 'diag', 'pricing', 'approval', 'order parts', 'in shipping', 'repair', 'payment'];

function Kanban() {
  const [tickets, setTickets] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    axios
      .get('/tickets', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
      .then((res) => setTickets(res.data));
  }, []);

  const moveTicket = (id, status) => {
    axios.put(
      `/tickets/${id}/status`,
      { status },
      { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
    );
    setTickets(tickets.map((t) => (t.id === id ? { ...t, status } : t)));
    toast.success('Status updated');
  };

  return (
    <div className="p-4">
      <div className="flex space-x-4 overflow-x-auto">
        {columns.map((col) => (
          <motion.div
            key={col}
            className="kanban-column"
            whileHover={{ boxShadow: '0 0 20px cyan' }}
          >
            <h3>{col}</h3>
            <div className="space-y-2">
              {tickets
                .filter((t) => t.status === col)
                .map((ticket) => (
                  <DraggableTicket
                    key={ticket.id}
                    ticket={ticket}
                    onMove={moveTicket}
                  />
                ))}
            </div>
          </motion.div>
        ))}
      </div>
      <button
        onClick={() => setShowHistory(!showHistory)}
        className="mt-4 gradient-btn"
      >
        Show History
      </button>
      {showHistory && <HistoryList />}
    </div>
  );
}

function DraggableTicket({ ticket, onMove }) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'ticket',
    item: { id: ticket.id },
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult();
      if (dropResult) onMove(item.id, dropResult.status);
    },
  }));

  return (
    <motion.div
      ref={drag}
      className="glassmorphism-card p-4"
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      #{ticket.id} - {ticket.customer_name}
    </motion.div>
  );
}

function HistoryList() {
  return <div>Last 10: [List here]</div>;
}

export default Kanban;