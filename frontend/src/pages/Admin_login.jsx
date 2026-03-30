import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../lib/apiClient";
import { useAdminSession } from "../contexts/AdminSession";

const DEFAULT_USERNAME = "vidyacoachingclasses.vcc.com";

const AdminLogin = () => {
  const [username, setUsername] = useState(DEFAULT_USERNAME);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAdminSession();

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");
    if (!password.trim()) {
      setError("Enter the password.");
      return;
    }
    setLoading(true);
    try {
      await apiClient.post("/admin/login", { username, password });
      await new Promise((resolve) => setTimeout(resolve, 1400));
      login(username, password);
      navigate("/admin", { replace: true });
    } catch (err) {
      setError(err?.message || "Invalid username or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#030712] p-4">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md space-y-6 rounded-3xl bg-white/95 p-8 shadow-2xl"
      >
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
            Admin gate
          </p>
          <h1 className="text-3xl font-black mt-2">Sign in to continue</h1>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs uppercase tracking-[0.3em] text-slate-500">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm focus:border-[#D41304] focus:outline-none"
              placeholder="Username"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.3em] text-slate-500">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm focus:border-[#D41304] focus:outline-none"
              placeholder="Enter your password"
            />
          </div>
        </div>
        {error && <p className="text-xs text-rose-500">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-gradient-to-r from-[#F97316] to-[#D41304] px-4 py-3 text-sm font-black uppercase tracking-[0.3em] text-white disabled:opacity-70"
        >
          {loading ? "Signing in…" : "Unlock admin"}
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;
