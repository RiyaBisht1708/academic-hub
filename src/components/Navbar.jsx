import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <nav className="bg-blue-700 text-white px-6 py-4 flex justify-between items-center shadow">
      <Link to="/dashboard" className="font-bold text-lg">
        Cloud Academic Resource Hub
      </Link>
      <div className="flex gap-4 items-center">
        {currentUser && (
          <>
            <Link to="/dashboard" className="hover:underline">Dashboard</Link>
            <Link to="/resources" className="hover:underline">Resources</Link>
            <button
              onClick={handleLogout}
              className="bg-white text-blue-700 px-3 py-1 rounded font-medium hover:bg-gray-100"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
