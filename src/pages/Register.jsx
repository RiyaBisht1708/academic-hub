import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    branch: "",
    semester: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    // Basic validation
    if (!form.fullName || !form.email || !form.password || !form.branch || !form.semester) {
      setError("All fields are required.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      await register(form);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-700">
          Create Account
        </h2>

        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <input
          name="fullName"
          placeholder="Full Name"
          value={form.fullName}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          name="password"
          type="password"
          placeholder="Password (min 6 characters)"
          value={form.password}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          name="branch"
          placeholder="Branch (e.g. CSE)"
          value={form.branch}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          name="semester"
          value={form.semester}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select Semester</option>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
            <option key={s} value={s}>{`Semester ${s}`}</option>
          ))}
        </select>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-700 text-white py-2 rounded font-medium hover:bg-blue-800 disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Register"}
        </button>

        <p className="text-center text-sm mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-700 font-medium">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
