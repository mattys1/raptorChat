
	return room.type == "group" ? (
		<div 
			className="flex items-center cursor-pointer hover:bg-gray-700 p-2 rounded-md"
			onClick={() => {navigate(`${ROUTES.CHATROOM}/${room.id}`)}}
		>
			<div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center mr-2">
				<span className="text-white text-sm">{room.name.charAt(0)}</span>
			</div>
			<span className="truncate text-blue-400">{room.name}</span>
		</div>
	) : (
