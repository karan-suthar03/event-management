import React, {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {HiOutlineLockClosed} from "react-icons/hi2";
import authService from "../utils/authService";
import apiService from "../utils/apiService";
import LoadingButton from "../components/LoadingButton";

const Login = () => {
    const [form, setForm] = useState({username: "", password: ""});
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [formTouched, setFormTouched] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuth = async () => {
            // Use enhanced validation to always check with server
            const authenticated = await authService.validateBeforePageLoad();
            if (authenticated) {
                navigate("/admin");
            }
        };

        checkAuth();
    }, [navigate]);

    const handleChange = (e) => {
        setForm({...form, [e.target.name]: e.target.value});

        // Clear error when user starts typing
        if (error) {
            setError("");
        }

        // Mark form as touched
        if (!formTouched) {
            setFormTouched(true);
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Prevent double submissions
        if (loading) return;

        setLoading(true);
        setError("");

        try {
            const data = await apiService.post("/api/auth/login", form);

            authService.login(data.token, data.admin);

            // Trigger authentication state change event
            window.dispatchEvent(new CustomEvent('authStateChanged'));

            navigate("/admin");
        } catch (e) {
            setError(e.response?.data?.error || "Login failed");
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="flex items-center justify-center p-4 md:p-8">
            <div className="bg-slate-800 rounded-xl shadow-2xl border border-slate-700 p-8 md:p-10 w-full max-w-md">
                <div className="text-center mb-8">
                    <HiOutlineLockClosed className="h-16 w-16 mx-auto text-sky-500 mb-4"/>
                    <h1 className="text-3xl font-bold text-sky-400">
                        Admin Access
                    </h1>
                    <p className="text-slate-400 mt-2">Please log in to manage events and offerings.</p>
                </div>
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <div>
                        <label className="block text-slate-300 font-medium mb-1.5 text-sm"
                               htmlFor="username">Username</label> <input
                        type="text"
                        id="username"
                        name="username"
                        value={form.username}
                        onChange={handleChange}
                        className="input-field w-full rounded-md border-2 border-slate-600 bg-slate-700 p-3 text-gray-200 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 placeholder-slate-400 transition-all duration-200"
                        placeholder="Enter your username"
                        required
                    />
                    </div>
                    <div>
                        <label className="block text-slate-300 font-medium mb-1.5 text-sm"
                               htmlFor="password">Password</label> <input
                        type="password"
                        id="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        className="input-field w-full rounded-md border-2 border-slate-600 bg-slate-700 p-3 text-gray-200 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 placeholder-slate-400 transition-all duration-200"
                        placeholder="Enter your password"
                        required
                    />
                    </div>
                    {error &&
                        <div
                            className="bg-red-900/30 border border-red-700 text-red-400 font-medium text-sm p-3 rounded-md text-center">
                            {error}
                        </div>
                    } <LoadingButton
                    type="submit"
                    loading={loading}
                    disabled={loading}
                    variant="primary"
                    size="lg"
                    className="w-full mt-2"
                >
                    <HiOutlineLockClosed className="w-5 h-5"/>
                    Login
                </LoadingButton>
                </form>
            </div>
        </div>
    );
};

export default Login;
