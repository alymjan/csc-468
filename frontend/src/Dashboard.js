import React, { useState } from 'react';

function Dashboard() {
  const [voted, setVoted] = useState(false);
  const [message, setMessage] = useState('');

  const handleVote = async (color) => {
    try {
      const response = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ choice: color }),
      });

      if (response.ok) {
        setVoted(true);
        setMessage(`You chose the ${color} pill.`);
      } else {
        setMessage('Failed to cast vote.');
      }
    } catch (error) {
      setMessage('Network error. Is the server running?');
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '100px', fontFamily: 'sans-serif' }}>
      <h1>Choose the pill</h1>
      
      {!voted ? (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '30px' }}>
          <button 
            onClick={() => handleVote('red')}
            style={{ 
              padding: '20px 40px', backgroundColor: '#e74c3c', color: 'white', 
              border: 'none', borderRadius: '8px', fontSize: '1.2rem', cursor: 'pointer' 
            }}
          >
            Red
          </button>
          <button 
            onClick={() => handleVote('blue')}
            style={{ 
              padding: '20px 40px', backgroundColor: '#3498db', color: 'white', 
              border: 'none', borderRadius: '8px', fontSize: '1.2rem', cursor: 'pointer' 
            }}
          >
            Blue
          </button>
        </div>
      ) : (
        <div style={{ marginTop: '30px' }}>
          <h2>{message}</h2>
          <p>The truth has been revealed.</p>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
