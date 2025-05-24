import React from "react";
import { EventResource } from "../../structs/Message";
import { useChangeUsernameHook } from "../hooks/views/useChangeUsernameHook";

const ChangeUsernameView: React.FC = () => {
  const props = useChangeUsernameHook();

  return (
    <div className="flex-1 p-8 min-h-screen bg-[#394A59] flex items-center justify-center">
      <div className="w-full max-w-md bg-[#1E2B3A] rounded-lg shadow-lg p-6 space-y-6">
        <h1 className="text-2xl font-bold text-white">Change Username</h1>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            props.changeUsername({
              channel: `user:${props.userId}`,
              method: "PATCH",
              event_name: "username_changed",
              contents: e.currentTarget.newUsername.value,
            } as EventResource<string>);
          }}
        >
          <label className="block text-sm font-medium text-gray-300">
            New Username
            <input
              name="newUsername"
              required
              className="mt-1 w-full px-3 py-2 bg-[#2F3B47] border border-gray-600 rounded-md focus:outline-none focus:ring focus:border-blue-300 text-white"
            />
          </label>
          <button
            type="submit"
            className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Change Username
          </button>
        </form>

        {props.cUsernameState === "SUCCESS" && (
          <p className="text-green-400">Username changed successfully!</p>
        )}
        {props.cUsernameState === "FAILURE" && (
          <p className="text-red-400">Error changing username: {props.error}</p>
        )}
      </div>
    </div>
  );
};

export default ChangeUsernameView;