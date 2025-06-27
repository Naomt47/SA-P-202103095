[Regresar](./README.md)

---

# Authentication App

This is a full-stack authentication application with Node.js (Express) backend and React (Vite) frontend, using JSON as a database and JWT for authentication.

## Project Structure

```
authentication-app/
├── backend/
│   ├── data/
│   │   └── users.json
│   ├── src/
│   │   ├── middleware/
│   │   │   └── auth.js
│   │   ├── routes/
│   │   │   └── auth.js
│   │   └── server.js
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## Backend Setup

### 1. `backend/package.json`

```json
{
  "name": "auth-backend",
  "version": "1.0.0",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js"
  },
  "dependencies": {
    "bcrypt": "^5.1.1",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.21.0",
    "jsonwebtoken": "^9.0.2",
    "jsonfile": "^6.1.0"
  },
  "devDependencies": {
    "nodemon": "^3.1.7"
  }
}
```

### 2. `backend/.env`

```
JWT_SECRET=your_jwt_secret_key
PORT=5000
```

### 3. `backend/data/users.json`

```json
{
  "users": []
}
```

### 4. `backend/src/server.js`

```javascript
const express = require('express');
const cors = require('cors');
const jsonfile = require('jsonfile');
const authRoutes = require('./routes/auth');

const app = express();
const file = 'data/users.json';

// Initialize users.json if it doesn't exist
jsonfile.readFile(file, (err, data) => {
  if (err && err.code === 'ENOENT') {
    jsonfile.writeFile(file, { users: [] }, { spaces: 2 }, (err) => {
      if (err) console.error('Error initializing users.json:', err);
    });
  }
});

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes(file));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

### 5. `backend/src/middleware/auth.js`

```javascript
const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = { verifyToken };
```

### 6. `backend/src/routes/auth.js`

```javascript
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const jsonfile = require('jsonfile');
const router = express.Router();

module.exports = (file) => {
  router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    try {
      const data = await jsonfile.readFile(file);
      const users = data.users || [];
      if (users.find(user => user.username === username)) {
        return res.status(400).json({ message: 'Username already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      users.push({ username, password: hashedPassword });
      await jsonfile.writeFile(file, { users }, { spaces: 2 });

      res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
      const data = await jsonfile.readFile(file);
      const user = data.users.find(user => user.username === username);

      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.json({ token });
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  return router;
};
```

## Frontend Setup

### 7. `frontend/package.json`

```json
{
  "name": "auth-frontend",
  "version": "0.0.0",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "axios": "^1.7.7",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.26.2",
    "tailwindcss": "^3.4.13"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.2",
    "vite": "^5.4.8"
  }
}
```

### 8. `frontend/vite.config.js`

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
});
```

### 9. `frontend/src/index.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  font-family: Arial, sans-serif;
  margin: 0;
  padding: 0;
  background-color: #f0f2f5;
}
```

### 10. `frontend/src/App.jsx`

```jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  );
}

export default App;
```

### 11. `frontend/src/main.jsx`

```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### 12. `frontend/src/components/Login.jsx`

```jsx
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
      alert('Login successful!');
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
            Login
          </button>
        </form>
        <p className="mt-4 text-center">
          Don't have an account? <Link to="/register" className="text-blue-500">Register</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
```

### 13. `frontend/src/components/Register.jsx`

```jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/auth/register', { username, password });
      alert('Registration successful! Please login.');
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
            Register
          </button>
        </form>
        <p className="mt-4 text-center">
          Already have an account? <Link to="/" className="text-blue-500">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
```

## Instructions to Run the Project

### Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)

### Backend Setup

1. Navigate to the `backend` directory:

   ```bash
   cd backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the `backend` directory and add:

   ```
   JWT_SECRET=your_jwt_secret_key
   PORT=5000
   ```

   Replace `your_jwt_secret_key` with a secure random string.

4. Start the backend server:

   ```bash
   npm run dev
   ```

   The server will run on `http://localhost:5000`.

### Frontend Setup

1. Navigate to the `frontend` directory:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the frontend development server:

   ```bash
   npm run dev
   ```

   The frontend will run on `http://localhost:5173` (or another port if 5173 is occupied).

### Usage

- Open `http://localhost:5173` in your browser.
- Use the **Register** page to create a new account.
- Use the **Login** page to authenticate and receive a JWT token (stored in localStorage).
- The backend uses `jsonfile` to store user data in `backend/data/users.json`.
- Passwords are hashed using `bcrypt` for security.
- JWT tokens are used for authentication and expire after 1 hour.

### Notes

- Ensure the backend server is running before starting the frontend.
- The frontend uses Tailwind CSS for styling and Axios for API requests.
- The backend uses `cors` to allow requests from the frontend.
- For production, consider using a proper database (e.g., MongoDB) instead of a JSON file and secure the JWT secret properly.


[Regresar](./README.md)