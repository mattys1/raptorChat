interface FormProps {
	readValue: string
	setValue: (email: string) => void
	label: string
	placeholder: string
	id: string
	hidden?: boolean
}

export const Form = ({
	readValue: readValue,
	setValue: setValue,
	label,
	placeholder,
	id,
	hidden = false
}: FormProps) => {
	return (
		<>
			<label htmlFor={id}>{label}</label>
			<input
				type={hidden ? "password" : "text"}
				id={id}
				name={id}
				placeholder={placeholder}
				required
				value={readValue}
				onChange={(e) => setValue(e.target.value)}
			/>
		</>
	)
}
