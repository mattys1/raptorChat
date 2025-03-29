package main

import (
	"context"
	"log"
	"sync"

	"github.com/coder/websocket"
	"github.com/mattys1/raptorChat/src/pkg/assert"
	"github.com/mattys1/raptorChat/src/pkg/db"
	msg "github.com/mattys1/raptorChat/src/pkg/messaging"
)

type Hub struct {
	clients map[*db.User]*websocket.Conn
	Register chan *websocket.Conn
	Unregister chan *websocket.Conn
	ctx context.Context
	router *msg.MessageRouter
}

func newHub(router *msg.MessageRouter) *Hub {
	return &Hub{
		Register:   make(chan *websocket.Conn),
		Unregister: make(chan *websocket.Conn),
		clients:    make(map[*db.User]*websocket.Conn),
		ctx:        context.Background(),
		router:     router,
	}
}

func (hub *Hub) run() {
	for {
		// FIXME: ideally, clients should be prepared elsewhere and registered here, not connections.
		select {
		case conn := <-hub.Register:
			// FIXME: AAAAAAA
			assert.That(len(hub.clients) + 1 <= 2, "Too many clients", nil)

			user, err := db.GetDao().GetUserById(hub.ctx, uint64(len(hub.clients) + 1))
			if err != nil {
				log.Println("Error getting user", err)
				break
			}

			hub.clients[&user] = conn
			// client.User = &user

			log.Println("Client registered", user, conn)
			go listenForMessages(conn, hub.router)

		case conn := <-hub.Unregister:
			for user, c := range hub.clients {
				if c == conn {
					hub.router.UnsubscribeAll(conn) //TODO: this may not be necessary
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
