import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

function Login() {
  const [form, setForm] = useState({ username: '', password: '', role: 'Tech' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/login', form);
      localStorage.setItem('token', res.data.token);
      window.location.href = '/kanban';
    } catch (err) {
      toast.error('Invalid credentials');
    }
  };

  return (
    <motion.div
      className="glassmorphism-card p-8 max-w-md mx-auto mt-20"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          className="input-field"
        />
        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="input-field"
        />
        <select
          onChange={(e) => setForm({ ...form, role: e.target.value })}
          className="input-field"
        >
          <option>Tech</option>
          <option>Admin</option>
        </select>
        <motion.button
          type="submit"
          className="gradient-btn"
          whileHover={{ y: -2 }}
        >
          Login
        </motion.button>
      </form>
    </motion.div>
  );
}

export default Login;