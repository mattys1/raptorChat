import React, { useEffect, useState } from "react";
import { useAudioInputs } from "../hooks/useAudioInputs";

interface MicrophoneSelectorProps {
	onDeviceSelect?: (deviceId: string) => void;
	className?: string;
}

export const MicrophoneSelector: React.FC<MicrophoneSelectorProps> = ({ 
	onDeviceSelect,
	className = ""
}) => {
	const [microphones, setMicrophones] = useAudioInputs();
	const [selectedDevice, setSelectedDevice] = useState<string>(() => {
		return localStorage.getItem("selectedMicrophone") || "";
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
		localStorage.setItem("selectedMicrophone", deviceId);
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
					{device.label || `Microphone (${device.deviceId.substring(0, 8)}...)`}
				</option>
			))}
		</select>
	);
};
