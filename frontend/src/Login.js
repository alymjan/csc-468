import React, { useState } from 'react';

// Added 'props' here to receive the callback from App.js
function Login(props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const endpoint = isRegistering ? '/api/register' : '/api/login';

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
        setMessage(`✅ Success: ${data.message || 'Logged in!'}`);
        
        // If it's a login (not a registration), tell App.js we are logged in
        if (!isRegistering) {
            if (props.onLoginSuccess) {
                props.onLoginSuccess(); 
            }
        }
      } else {
        setMessage(`❌ Error: ${data.error || 'Something went wrong.'}`);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setMessage('❌ Network error. Is the server running?');
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
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        <button 
          type="submit" 
          style={{ padding: '10px', backgroundColor: '#007BFF', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          {isRegistering ? 'Sign Up' : 'Log In'}
        </button>
      </form>

      {message && <p style={{ marginTop: '20px', fontWeight: 'bold' }}>{message}</p>}

      <hr style={{ margin: '30px 0' }} />

      <button 
        onClick={() => {
          setIsRegistering(!isRegistering);
          setMessage(''); 
        }}
        style={{ background: 'none', border: 'none', color: '#007BFF', textDecoration: 'underline', cursor: 'pointer' }}
      >
        {isRegistering ? 'Already have an account? Log in here.' : 'Need an account? Sign up here.'}
      </button>
    </div>
  );
}

export default Login;
