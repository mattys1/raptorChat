package main

import (
	"context"
	"log"
	"sync"

	"github.com/coder/websocket"
	"github.com/mattys1/raptorChat/src/pkg/assert"
	"github.com/mattys1/raptorChat/src/pkg/db"
)

type Hub struct {
	clients map[*Client]bool
	Register chan *websocket.Conn
	Unregister chan *websocket.Conn
	ctx context.Context
}

func newHub() *Hub {
	return &Hub{
		Register:   make(chan *websocket.Conn),
		Unregister: make(chan *websocket.Conn),
		clients:    make(map[*Client]bool),
		ctx:        context.Background(),
	}
}

func (hub *Hub) run() {
	for {
		// FIXME: ideally, clients should be prepared elsewhere and registered here, not connections.
		select {
		case conn := <-hub.Register:
			client := &Client{
				Connection: conn,
			}
			
			hub.clients[client] = true

			// FIXME: AAAAAAA
			assert.That(len(hub.clients) <= 2, "Too many clients")

			user, err := db.GetDao().GetUserById(hub.ctx, uint64(len(hub.clients)))
			client.User = &user
			assert.That(err == nil, "Failed to get user")

			hub.clients[client] = true

			log.Println("Client registered", conn)

		case conn := <-hub.Unregister:
			clientWithConn := func(c *websocket.Conn) *Client {
				for client := range hub.clients {
					if client.Connection == c {
						return client
					}
				}
				return nil	
			}(conn)

			assert.That(clientWithConn != nil, "Attempting to unregister a nonexistent client")

			if _, ok := hub.clients[clientWithConn]; ok {
				log.Println("Client unregistered", conn)
				delete(hub.clients, clientWithConn)
				conn.Close(websocket.StatusNormalClosure, "Connection closing")
			}
		}
	}
}


var instance *Hub
var once sync.Once

func GetHub() *Hub {
	once.Do(func() {
		instance = newHub()
	})

	return instance
}
