import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { HiOutlineLockClosed } from "react-icons/hi2";
import { FaSpinner } from "react-icons/fa6";
import authService from "../utils/authService";
import apiService from "../utils/apiService";

const Login = () => {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (authService.isLoggedIn()) {
      navigate("/admin");
    }
  }, [navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await apiService.post("/api/auth/login", form);
      authService.login(data.token, data.admin);
      navigate("/admin");
    } catch (e) {
      setError(e.response?.data?.error || "Login failed");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8">
      <div className="bg-slate-800 rounded-xl shadow-2xl border border-slate-700 p-8 md:p-10 w-full max-w-md">
        <div className="text-center mb-8">
          <HiOutlineLockClosed className="h-16 w-16 mx-auto text-sky-500 mb-4" />
          <h1 className="text-3xl font-bold text-sky-400">
            Admin Access
          </h1>
          <p className="text-slate-400 mt-2">Please log in to manage events and offerings.</p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div>
            <label className="block text-slate-300 font-medium mb-1.5 text-sm" htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={form.username}
              onChange={handleChange}
              className="w-full rounded-md border-2 border-slate-600 bg-slate-700 p-3 text-gray-200 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 placeholder-slate-400 transition duration-150 ease-in-out"
              placeholder="Enter your username"
              required
            />
          </div>
          <div>
            <label className="block text-slate-300 font-medium mb-1.5 text-sm" htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="w-full rounded-md border-2 border-slate-600 bg-slate-700 p-3 text-gray-200 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 placeholder-slate-400 transition duration-150 ease-in-out"
              placeholder="Enter your password"
              required
            />
          </div>
          {error && 
            <div className="bg-red-900/30 border border-red-700 text-red-400 font-medium text-sm p-3 rounded-md text-center">
              {error}
            </div>
          }
          <button
            type="submit"
            className="w-full px-6 py-3 mt-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg shadow-md transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-50 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center"
            disabled={loading}
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                Processing...
              </>
            ) : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
