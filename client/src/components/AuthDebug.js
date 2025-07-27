import React, { useState, useEffect } from 'react';

const AuthDebug = () => {
  const [debugInfo, setDebugInfo] = useState({});

  useEffect(() => {
    const token = localStorage.getItem('token');
    setDebugInfo({
      token: token ? 'Present' : 'Missing',
      tokenLength: token ? token.length : 0,
      tokenPreview: token ? token.substring(0, 20) + '...' : 'N/A',
      currentPath: window.location.pathname,
      timestamp: new Date().toLocaleTimeString()
    });
  }, []);

  const clearToken = () => {
    localStorage.removeItem('token');
    setDebugInfo(prev => ({ ...prev, token: 'Missing', tokenLength: 0, tokenPreview: 'N/A' }));
  };

  const testAPI = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/expenses', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        alert(`API Test Success! Found ${data.length} expenses`);
      } else {
        alert(`API Test Failed: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      alert(`API Test Error: ${error.message}`);
    }
  };

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: '#f0f0f0', 
      padding: '10px', 
      border: '1px solid #ccc',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 1000
    }}>
      <h4>Auth Debug</h4>
      <div>Token: {debugInfo.token}</div>
      <div>Length: {debugInfo.tokenLength}</div>
      <div>Preview: {debugInfo.tokenPreview}</div>
      <div>Path: {debugInfo.currentPath}</div>
      <div>Time: {debugInfo.timestamp}</div>
      <button onClick={clearToken} style={{ margin: '5px' }}>Clear Token</button>
      <button onClick={testAPI} style={{ margin: '5px' }}>Test API</button>
    </div>
  );
};

export default AuthDebug; 