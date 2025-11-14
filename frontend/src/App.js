import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { motion } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import Login from './components/Login';
import Kanban from './components/Kanban';
import TicketForm from './components/TicketForm';
import TicketView from './components/TicketView';
import CustomerPortal from './components/CustomerPortal';
import AdminDash from './components/AdminDash';

function App() {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  return (
    <DndProvider backend={HTML5Backend}>
      <BrowserRouter>
        <div className={`min-h-screen ${theme === 'dark' ? 'bg-black text-cyan-400' : 'bg-white text-black'}`}>
          <motion.button
            className="fixed top-4 right-4 p-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:shadow-lg hover:-translate-y-1 transition"
            onClick={toggleTheme}
            whileHover={{ scale: 1.1 }}
          >
            {theme === 'dark' ? '🌙' : '☀️'}
          </motion.button>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/kanban" element={<Kanban />} />
            <Route path="/new-ticket" element={<TicketForm />} />
            <Route path="/ticket/:id" element={<TicketView />} />
            <Route path="/portal/:id" element={<CustomerPortal />} />
            <Route path="/admin" element={<AdminDash />} />
          </Routes>
          <Toaster />
        </div>
      </BrowserRouter>
    </DndProvider>
  );
}

export default App;