import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', { username, password });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('username', username); // Store username for welcome page
      alert('Login successful!');
      navigate('/welcome');
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="retro-card">
        <h2 className="text-3xl font-bold mb-6 text-center text-amber-900">Login</h2>
        {error && <p className="retro-error">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-amber-900">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="retro-input"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-amber-900">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="retro-input"
              required
            />
          </div>
          <button type="submit" className="retro-button">
            Login
          </button>
        </form>
        <p className="mt-4 text-center text-amber-900">
          Don't have an account? <Link to="/register" className="retro-link">Register</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;