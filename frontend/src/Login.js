import React, { useState } from 'react';

function Login() {
  // State to hold form inputs and UI feedback
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false); // Toggles between Login and Sign Up
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Choose the correct backend route based on the current mode
    const endpoint = isRegistering 
      ? 'http://localhost:5000/register' 
      : 'http://localhost:5000/login';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`✅ Success: ${data.message}`);
        // If logging in, you would typically redirect the user to the voting dashboard here
        // e.g., window.location.href = '/dashboard';
      } else {
        setMessage(`❌ Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setMessage('❌ Network error. Is the Node.js backend running?');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h1>{isRegistering ? 'Create an Account' : 'Voting App Login'}</h1>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label htmlFor="username" style={{ display: 'block', marginBottom: '5px' }}>Username:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>
        
        <div>
          <label htmlFor="password" style={{ display: 'block', marginBottom: '5px' }}>Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box'
