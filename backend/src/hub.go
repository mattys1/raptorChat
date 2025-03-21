package main

import (
	"log"
)

type Hub struct {
	clients map[*Client]bool
	register chan *Client
	unregister chan *Client
}

func newHub() *Hub {
	return &Hub{
		register:   make(chan *Client),
		unregister: make(chan *Client),
		clients:    make(map[*Client]bool),
	}
}

func (hub *Hub) run() {
	for {
		select {
		case client := <-hub.register:
			hub.clients[client] = true
			log.Println("Client registered", client)

		case client := <-hub.unregister:
			if _, ok := hub.clients[client]; ok {
				log.Println("Client unregistered", client)
				delete(hub.clients, client)
			}
		}
	}
}
