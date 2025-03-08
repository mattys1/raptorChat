import React, { useState, useEffect, useRef } from 'react'
import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import styles from './App.module.css'

interface Socketable {
	server: WebSocket
}

const TextSender: React.FC<Socketable> = ({server}) => {
	const [text, setText] = useState('')

	return (
		<div>
			<input onChange = {
				(x) => setText(x.target.value)
			} />

			<br/>
			<button onClick={() => server.send(text)}>
				Submit
			</button>
		</div>

	)
}

function App() {
	const [count, setCount] = useState(0)
	var [connectionStatus, setConnectionStatus] = useState('')
	const serverRef = useRef<WebSocket>(null)

	useEffect(() => {
		const server = new WebSocket('ws://0.0.0.0:8080/ws')
		serverRef.current = server

		server.onopen = () => {
			console.log('WebSocket Server Connected')
			setConnectionStatus('connected')
		}

		server.onerror = (error) => {
			console.log("ERROR: ERROR: ERROR: ", error)
			setConnectionStatus('error')
		}

		server.onmessage = (event) => {
			const currentVal = parseInt(event.data.toString())
			setCount(currentVal)
		}

		return () => {
			server.close()
		}
	}, []) 

	var site = (
		<>
			<div className={styles.card}>
				<button onClick={() => serverRef?.current?.send("button-pressed")}>
					count is {count}
				</button>
			</div>

			{connectionStatus === 'connected' && <p style={{ color: 'green' }}>Connected</p>}
			{connectionStatus === 'error' && <p style={{ color: 'red' }}>Error connecting</p>}

			{serverRef?.current && <TextSender server={serverRef.current} /> }
		</>
	)

	return site
}

export default App
