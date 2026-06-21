import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  const navLinkClass =
    "text-sm font-medium text-white/90 hover:text-white transition-colors";

  return (
    <nav className="bg-blue-700 text-white px-4 md:px-6 py-4 shadow-lg">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link to="/dashboard" className="font-bold text-lg tracking-tight">
          Cloud Academic Resource Hub
        </Link>

        {currentUser && (
          <div className="flex items-center gap-3 md:gap-5">
            <Link to="/dashboard" className={`hidden sm:inline ${navLinkClass}`}>
              Dashboard
            </Link>
            <Link to="/resources" className={navLinkClass}>
              Resources
            </Link>
            <Link to="/bookmarks" className={`hidden sm:inline ${navLinkClass}`}>
              Bookmarks
            </Link>
            <Link to="/profile" className={`hidden md:inline ${navLinkClass}`}>
              Profile
            </Link>
            <button
              onClick={handleLogout}
              className="bg-white text-blue-700 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
