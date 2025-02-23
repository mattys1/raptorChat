import { useState, useEffect, useRef } from 'react'
import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import styles from './App.module.css'

function App() {
	const [count, setCount] = useState(0)
	var [connectionStatus, setConnectionStatus] = useState('')
	const serverRef = useRef<WebSocket>(null)

	useEffect(() => {
		// Create WebSocket connection only once
		const server = new WebSocket('ws://localhost:8080/ws')
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

		// Cleanup function to close connection
		return () => {
			server.close()
		}
	}, []) // Empty dependency array ensures this runs only once

	var site = (
		<>
			<div>
				<a href="https://react.dev" target="_blank">
					<img src={reactLogo} className={`${styles.logo} ${styles.react}`} alt="React logo" />
				</a>
			</div>

			<h1>Vite + React</h1>
			<div className={styles.card}>
				<button onClick={() => serverRef?.current?.send("button-pressed")}>
					count is {count}
				</button>
				<p>
					Edit <code>src/App.tsx</code> and save to test HMR
				</p>
			</div>
			<p className={styles.readTheDocs}>
				Click on the Vite and React logos to learn more
			</p>

			{connectionStatus === 'connected' && <p style={{ color: 'green' }}>Connected</p>}
			{connectionStatus === 'error' && <p style={{ color: 'red' }}>Error connecting</p>}
		</>
	)

	return site
}

export default App
