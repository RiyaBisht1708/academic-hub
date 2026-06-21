import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

export default function Dashboard() {
  const { currentUser, userProfile } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-6 text-blue-700">
            Welcome, {userProfile?.fullName || currentUser?.email}
          </h2>

          <div className="space-y-2 text-gray-700">
            <p><span className="font-medium">Email:</span> {currentUser?.email}</p>
            <p><span className="font-medium">Branch:</span> {userProfile?.branch || "—"}</p>
            <p><span className="font-medium">Semester:</span> {userProfile?.semester || "—"}</p>
            <p><span className="font-medium">Role:</span> {userProfile?.role || "Student"}</p>
            <p><span className="font-medium">Uploads:</span> {userProfile?.uploadCount ?? 0}</p>
          </div>

          <Link
            to="/resources"
            className="inline-block mt-6 bg-blue-700 text-white px-5 py-2 rounded font-medium hover:bg-blue-800"
          >
            Go to Resources
          </Link>
        </div>
      </div>
    </div>
  );
}
