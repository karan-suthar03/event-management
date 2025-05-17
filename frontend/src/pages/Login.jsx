import React, { useState } from "react";

const Login = () => {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    // Simulate login (replace with real API call later)
    setTimeout(() => {
      if (form.username === "admin" && form.password === "password") {
        // Redirect to admin dashboard (replace with real logic)
        window.location.href = "/admin";
      } else {
        setError("Invalid username or password");
        setLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-rose-100 to-yellow-50 p-8">
      <div className="bg-white/80 rounded-3xl shadow-2xl border-2 border-pink-100 p-10 w-full max-w-md">
        <h1 className="text-3xl font-extrabold text-pink-700 font-cursive mb-6 text-center flex items-center gap-2 justify-center">
          <span role="img" aria-label="lock">🔒</span> Admin Login
        </h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div>
            <label className="block text-pink-700 font-semibold mb-2">Username</label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              className="w-full rounded-lg border-2 border-pink-200 p-3 focus:outline-none focus:border-pink-400 bg-white"
              placeholder="Enter admin username"
              required
            />
          </div>
          <div>
            <label className="block text-pink-700 font-semibold mb-2">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="w-full rounded-lg border-2 border-pink-200 p-3 focus:outline-none focus:border-pink-400 bg-white"
              placeholder="Enter password"
              required
            />
          </div>
          {error && <div className="text-red-600 font-bold text-center">{error}</div>}
          <button
            type="submit"
            className="w-full px-8 py-3 bg-gradient-to-r from-pink-400 to-yellow-300 text-white font-bold rounded-full shadow hover:from-pink-500 hover:to-yellow-400 transition"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
