import React, { useState, useEffect, useRef } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
// import styles from './App.module.css'

interface Socketable {
	server: WebSocket
}

interface Message {
	senderAddress: string
	content: string
}

const Messages: React.FC<{messages: Message[]}> = ({messages}) => {
	return (
		messages.map((message) => {
			return (
				<div>
					<p >Sender: {message.senderAddress}</p>
					<p >{message.content}</p>
				</div> 
			)
		})
	) 
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
	// const [count] = useState(0)
	const [messages, setMessages] = useState<Message[]>([])

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
			const message = JSON.parse(event.data)
			console.log('Message received: ', message.content)

			setMessages(prev => [...prev, {
				senderAddress: JSON.stringify(message.sender.ip),
				content: JSON.stringify(message.content)
			}])

			// console.log(messages.length)
		}

		return () => {
			server.close()
		}
	}, []) 

	var site = (
		<>
			<Messages messages={messages} />
			{connectionStatus === 'connected' && <p style={{ color: 'green' }}>Connected</p>}
			{connectionStatus === 'error' && <p style={{ color: 'red' }}>Error connecting</p>}

			{serverRef?.current && <TextSender server={serverRef.current} /> }
		</>
	)

	return site
}

export default App
