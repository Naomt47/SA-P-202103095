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
    <div className="flex items-center justify-center min-h-screen">
      <div className="retro-card text-center">
        <h2 className="text-3xl font-bold mb-6 text-amber-900">Welcome, {username}!</h2>
        <p className="text-amber-900 mb-6">You've successfully logged in to our retro app!</p>
        <button
          onClick={handleLogout}
          className="retro-button"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default Welcome;