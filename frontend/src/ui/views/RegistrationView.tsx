// frontend/src/ui/views/RegistrationView.tsx
import React from "react";
import { useRegistrationHook } from "../hooks/views/useRegistrationHook";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../routes";
import logo from "../logo/logo.png";

const RegistrationView: React.FC = () => {
  const navigate = useNavigate();
  const {
    email,
    username,
    password,
    repeatPassword,
    loading,
    setEmail,
    setUsername,
    setPassword,
    setRepeatPassword,
    handleSubmit,
  } = useRegistrationHook(navigate);

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
          Create Account
        </h1>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="flex flex-col">
            <label htmlFor="email" className="text-md text-gray-300 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="w-full px-3 py-2 rounded bg-gray-700 text-white focus:outline-none focus:ring"
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="username" className="text-md text-gray-300 mb-2">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
              className="w-full px-3 py-2 rounded bg-gray-700 text-white focus:outline-none focus:ring"
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="password" className="text-md text-gray-300 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="w-full px-3 py-2 rounded bg-gray-700 text-white focus:outline-none focus:ring"
            />
          </div>

          <div className="flex flex-col">
            <label
              htmlFor="repeatPassword"
              className="text-md text-gray-300 mb-2"
            >
              Repeat Password
            </label>
            <input
              id="repeatPassword"
              type="password"
              value={repeatPassword}
              onChange={(e) => setRepeatPassword(e.target.value)}
              placeholder="Repeat your password"
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
              {loading ? "Creating account..." : "Create account"}
            </button>
            <button
              type="button"
              onClick={() => navigate(ROUTES.ROOT)}
              className="flex-1 py-2 bg-[#7E57C2] text-white rounded hover:bg-[#6b49a7] transition-colors"
            >
              Already have an account? Log in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegistrationView;