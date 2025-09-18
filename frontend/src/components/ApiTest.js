import React, { useState } from 'react';
import { authService } from '../services/api';

const ApiTest = () => {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testRegistration = async () => {
    setLoading(true);
    try {
      const testUser = {
        username: 'testuser' + Date.now(),
        email: 'test' + Date.now() + '@example.com',
        password: 'password123'
      };
      
      console.log('Testing registration with:', testUser);
      const response = await authService.register(testUser);
      console.log('Registration response:', response);
      setResult('Registration successful: ' + JSON.stringify(response.data, null, 2));
    } catch (error) {
      console.error('Registration error:', error);
      setResult('Registration failed: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const testLogin = async () => {
    setLoading(true);
    try {
      const response = await authService.login('test@example.com', 'password123');
      console.log('Login response:', response);
      setResult('Login successful: ' + JSON.stringify(response.data, null, 2));
    } catch (error) {
      console.error('Login error:', error);
      setResult('Login failed: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px' }}>
      <h3>API Test Component</h3>
      <div style={{ marginBottom: '10px' }}>
        <button onClick={testRegistration} disabled={loading}>
          Test Registration
        </button>
        <button onClick={testLogin} disabled={loading} style={{ marginLeft: '10px' }}>
          Test Login
        </button>
      </div>
      {loading && <p>Loading...</p>}
      <pre style={{ background: '#f5f5f5', padding: '10px', whiteSpace: 'pre-wrap' }}>
        {result}
      </pre>
    </div>
  );
};

export default ApiTest;