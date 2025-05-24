import React from "react";
import { useChangePasswordHook } from "../hooks/views/useChangePasswordHook";

const ChangePasswordView: React.FC = () => {
  const props = useChangePasswordHook();

  return (
    <div className="flex-1 p-8 min-h-screen bg-[#394A59] flex items-center justify-center">
      <div className="w-full max-w-md bg-[#1E2B3A] rounded-lg shadow-lg p-6 space-y-6">
        <h1 className="text-2xl font-bold text-white">Change Password</h1>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            props.changePassword({
              old_password: e.currentTarget.oldPassword.value,
              new_password: e.currentTarget.newPassword.value,
            });
          }}
        >
          <label className="block text-sm font-medium text-gray-300">
            Old Password
            <input
              type="password"
              name="oldPassword"
              required
              className="mt-1 w-full px-3 py-2 bg-[#2F3B47] border border-gray-600 rounded-md focus:outline-none focus:ring focus:border-green-300 text-white"
            />
          </label>
          <label className="block text-sm font-medium text-gray-300">
            New Password
            <input
              type="password"
              name="newPassword"
              required
              className="mt-1 w-full px-3 py-2 bg-[#2F3B47] border border-gray-600 rounded-md focus:outline-none focus:ring focus:border-green-300 text-white"
            />
          </label>
          <button
            type="submit"
            className="w-full py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Change Password
          </button>
        </form>

        {props.cPasswordStat === "SUCCESS" && (
          <p className="text-green-400">Password changed successfully!</p>
        )}
        {props.cPasswordStat === "FAILURE" && (
          <p className="text-red-400">Error changing password: {props.error}</p>
        )}
      </div>
    </div>
  );
};

export default ChangePasswordView;