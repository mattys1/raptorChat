import React from "react";
import { useCreateRoomHook } from "../hooks/views/useCreateRoomHook";
import { EventResource } from "../../structs/Message";
import { Room, RoomsType } from "../../structs/models/Models";

const CreateRoomView: React.FC = () => {
  const props = useCreateRoomHook();
  const uID = Number(localStorage.getItem("uID"));

  return (
    <div className="flex-1 bg-[#394A59] min-h-screen flex justify-center items-start p-8">
      <div className="w-full max-w-lg bg-[#1E2B3A] text-white rounded-lg shadow p-6 space-y-6">
        <h1 className="text-2xl font-bold">Create Room</h1>

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const name = String(formData.get("name"));

            props.createRoom({
              channel: `user:${uID}:rooms`,
              method: "POST",
              event_name: "create_room",
              contents: {
                id: 0,
                name: name,
                owner_id: uID,
                type: RoomsType.Group,
              } as Room,
            } as EventResource<Room>);
          }}
        >
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium mb-1"
            >
              Room Name:
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              className="
                w-full px-3 py-2
                bg-[#2F3C4C] border border-gray-600
                rounded focus:outline-none focus:ring-2 focus:ring-blue-500
              "
            />
          </div>

          <button
            type="submit"
            className="
              inline-flex items-center
              bg-blue-600 hover:bg-blue-700
              text-white
              px-4 py-2
              rounded
              transition-colors duration-200
            "
          >
            Create Room
          </button>
        </form>

        {props.createRoomStatus === "FAILURE" && (
          <p className="text-sm text-red-400">Error: {props.error}</p>
        )}
        {props.createRoomStatus === "SUCCESS" && (
          <p className="text-sm text-green-400">
            Room created successfully!
          </p>
        )}
      </div>
    </div>
  );
};

export default CreateRoomView;
