package main

import (
	"context"
	"log"
	"sync"

	"github.com/coder/websocket"
	"github.com/mattys1/raptorChat/src/pkg/db"
	msg "github.com/mattys1/raptorChat/src/pkg/messaging"
)

type Hub struct {
	clients    map[*db.User]*websocket.Conn
	Register   chan *Client
	Unregister chan *websocket.Conn
	ctx        context.Context
	router     *msg.MessageRouter
}

func newHub(router *msg.MessageRouter) *Hub {
	return &Hub{
		Register:   make(chan *Client),
		Unregister: make(chan *websocket.Conn),
		clients:    make(map[*db.User]*websocket.Conn),
		ctx:        context.Background(),
		router:     router,
	}
}

func (hub *Hub) run() {
	for {
		select {
		case client := <-hub.Register:
			hub.clients[client.User] = client.Connection
			log.Println("Client registered", client.User, client.Connection)
			go listenForMessages(client.Connection, hub.router)
		case conn := <-hub.Unregister:
			for user, c := range hub.clients {
				if c == conn {
					hub.router.UnsubscribeAll(conn) // TODO: this may not be necessary
					delete(hub.clients, user)
					log.Println("Client unregistered", user, c)
					conn.Close(websocket.StatusNormalClosure, "Connection closing")
					break
				}
			}
		}
	}
}

var instance *Hub
var once sync.Once

func GetHub() *Hub {
	once.Do(func() {
		router := msg.NewMessageRouter()
		instance = newHub(router)
	})

	return instance
}
