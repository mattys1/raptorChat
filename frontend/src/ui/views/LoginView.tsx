// frontend/src/ui/views/LoginView.tsx
import React from "react";
import { useLoginHook } from "../hooks/views/useLoginHook";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../routes";
import logo from "../logo/logo.png";

const LoginView: React.FC = () => {
  const navigate = useNavigate();
  const { email, password, loading, setEmail, setPassword, handleSubmit } =
    useLoginHook(navigate);

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#394A59] p-4">
      <div className="bg-[#1E2B3A] w-full max-w-md rounded-lg p-8 space-y-6">
        <div className="flex justify-center">
          <img
            src={logo}
            alt="raptorChat logo"
            className="h-40 w-40"
          />
        </div>

        <h1 className="text-2xl text-white font-semibold text-center">
          Log In
        </h1>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="flex flex-col">
            <label
              htmlFor="userEmail"
              className="text-md text-gray-300 mb-2"
            >
              Email
            </label>
            <input
              id="userEmail"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email or nickname"
              required
              className="w-full px-3 py-2 rounded bg-gray-700 text-white focus:outline-none focus:ring"
            />
          </div>

          <div className="flex flex-col">
            <label
              htmlFor="userPassword"
              className="text-md text-gray-300 mb-2"
            >
              Password
            </label>
            <input
              id="userPassword"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              className="w-full px-3 py-2 rounded bg-gray-700 text-white focus:outline-none focus:ring"
            />
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 bg-[#5C4CE7] text-white rounded hover:bg-[#473ac0] transition-colors"
            >
              {loading ? "Logging in..." : "Log In"}
            </button>
            <button
              type="button"
              onClick={() => navigate(ROUTES.REGISTER)}
              className="flex-1 py-2 bg-[#7E57C2] text-white rounded hover:bg-[#6b49a7] transition-colors"
            >
              Create Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginView;