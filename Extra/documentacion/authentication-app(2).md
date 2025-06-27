# Authentication App

This is a full-stack authentication application with Node.js (Express) backend and React (Vite) frontend, using JSON as a database and JWT for authentication. It now includes a retro/vintage design and new features: logout functionality and a welcome page after successful login.

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
│   │   │   ├── Register.jsx
│   │   │   ├── Welcome.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
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
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.47",
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

### 9. `frontend/tailwind.config.js`

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### 10. `frontend/postcss.config.js`

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

### 11. `frontend/src/index.css`

```css
@import url('https://fonts.googleapis.com/css2?family=Special+Elite&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  font-family: 'Special Elite', cursive;
  margin: 0;
  padding: 0;
  background-color: #f4e4bc; /* Beige retro background */
  background-image: linear-gradient(rgba(0, 0, 0, 0.05) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(0, 0, 0, 0.05) 1px, transparent 1px);
  background-size: 20px 20px; /* Subtle grid texture */
  color: #4a3728; /* Dark brown text */
}

.container {
  @apply flex items-center justify-center min-h-screen;
}

.card {
  @apply bg-[#fff5e1] p-8 rounded-lg shadow-lg w-96 border-4 border-[#8b6f47];
  background-image: url('data:image/svg+xml,%3Csvg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="%238b6f47" fill-opacity="0.1"%3E%3Ccircle cx="3" cy="3" r="1"/%3E%3C/g%3E%3C/svg%3E');
}

h2 {
  @apply text-3xl font-bold mb-6 text-center text-[#4a3728];
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
}

input {
  @apply w-full p-3 border-2 border-[#8b6f47] rounded-md bg-[#fff5e1] text-[#4a3728] focus:outline-none focus:border-[#d4a373];
  font-family: 'Special Elite', cursive;
}

button {
  @apply w-full p-3 bg-gradient-to-r from-[#8b6f47] to-[#d4a373] text-white rounded-md border-2 border-[#4a3728] hover:from-[#d4a373] hover:to-[#8b6f47] transition-all;
  font-family: 'Special Elite', cursive;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}

.error {
  @apply text-[#b22222] mb-4 text-center font-semibold;
}

.link {
  @apply text-[#8b6f47] hover:underline;
}
```

### 12. `frontend/src/App.jsx`

```jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Welcome from './components/Welcome';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/welcome"
          element={
            <ProtectedRoute>
              <Welcome />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
```

### 13. `frontend/src/main.jsx`

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

### 14. `frontend/src/components/Login.jsx`

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
      localStorage.setItem('username', username); // Store username for welcome page
      navigate('/welcome');
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h2>Login</h2>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full"
              required
            />
          </div>
          <button type="submit">Login</button>
        </form>
        <p className="mt-4 text-center">
          Don't have an account? <Link to="/register" className="link">Register</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
```

### 15. `frontend/src/components/Register.jsx`

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
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h2>Register</h2>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full"
              required
            />
          </div>
          <button type="submit">Register</button>
        </form>
        <p className="mt-4 text-center">
          Already have an account? <Link to="/" className="link">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
```

### 16. `frontend/src/components/Welcome.jsx`

```jsx
import { useNavigate } from 'react-router-dom';

function Welcome() {
  const navigate = useNavigate();
  const username = localStorage.getItem('username') || 'User';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/');
  };

  return (
    <div className="container">
      <div className="card">
        <h2>Welcome, {username}!</h2>
        <p className="text-center text-lg mb-6">You have successfully logged in to your account.</p>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
}

export default Welcome;
```

### 17. `frontend/src/components/ProtectedRoute.jsx`

```jsx
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/" />;
}

export default ProtectedRoute;
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
- Use the **Login** page to authenticate. Upon successful login, you will be redirected to the **Welcome** page.
- The **Welcome** page displays a personalized greeting and a **Logout** button.
- Clicking **Logout** removes the token and username from `localStorage` and redirects to the login page.
- The backend uses `jsonfile` to store user data in `backend/data/users.json`.
- Passwords are hashed using `bcrypt` for security.
- JWT tokens are used for authentication and expire after 1 hour.

### Notes

- Ensure the backend server is running before starting the frontend.
- The frontend uses Tailwind CSS with custom retro/vintage styles in `index.css` and Axios for API requests.
- The backend uses `cors` to allow requests from the frontend.
- For production, consider using a proper database (e.g., MongoDB) instead of a JSON file and secure the JWT secret properly.
- The retro/vintage design uses the "Special Elite" font, a sepia-toned color palette, and subtle textures to evoke a nostalgic feel.
- The `ProtectedRoute` component ensures that only authenticated users (with a valid token in `localStorage`) can access the welcome page.
- If you encounter any issues with Tailwind CSS, ensure that `postcss` and `autoprefixer` are installed, and restart the Vite development server (`npm run dev`) after updating configuration files.