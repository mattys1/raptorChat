import React, { useEffect, useState } from "react";
import { useMediaInputs } from "../hooks/useAudioInputs";

interface DeviceSelectorProps {
	onDeviceSelect?: (deviceId: string) => void;
	className?: string;
	storageName: string
	displayName: string
}

export const DeviceSelector: React.FC<DeviceSelectorProps> = ({ 
	onDeviceSelect,
	className = "",
	storageName,
	displayName,
}) => {
	const [microphones, setMicrophones] = useMediaInputs({
		constraints: storageName == "selectedMicrophone" ? {audio: true} : {video: true},
		deviceKind: storageName == "selectedMicrophone" ? "audioinput" : "videoinput",
	});
	const [selectedDevice, setSelectedDevice] = useState<string>(() => {
		return localStorage.getItem(storageName) || "";
	});

	useEffect(() => {
		// Set default device if available and none selected
		if (microphones.length > 0 && !selectedDevice) {
			const defaultDevice = microphones[0].deviceId;
			handleDeviceChange(defaultDevice);
		}
	}, [microphones, selectedDevice]);

	const handleDeviceChange = (deviceId: string) => {
		setSelectedDevice(deviceId);
		localStorage.setItem(storageName, deviceId);
		if (onDeviceSelect) onDeviceSelect(deviceId);
	};

	return (
		<select 
			className={className}
			value={selectedDevice} 
			onChange={(e) => handleDeviceChange(e.target.value)}
		>
			{microphones.map((device) => (
				<option key={device.deviceId} value={device.deviceId}>
					{device.label || `${displayName} (${device.deviceId.substring(0, 8)}...)`}
				</option>
			))}
		</select>
	);
};
