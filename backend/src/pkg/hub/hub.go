package hub

import (
	"context"
	"log"
	"sync"

	"github.com/coder/websocket"
	"github.com/mattys1/raptorChat/src/pkg/assert"
	"github.com/mattys1/raptorChat/src/pkg/db"
	msg "github.com/mattys1/raptorChat/src/pkg/messaging"
	"github.com/mattys1/raptorChat/src/pkg/orm"
)

type Hub struct {
	Clients map[*db.User]*websocket.Conn
	Register chan *websocket.Conn
	Unregister chan *websocket.Conn
	ctx        context.Context
	router     *msg.MessageRouter
}

func newHub(router *msg.MessageRouter) *Hub {
	return &Hub{
		Register:   make(chan *websocket.Conn),
		Unregister: make(chan *websocket.Conn),
		Clients:    make(map[*db.User]*websocket.Conn),
		ctx:        context.Background(),
		router:     router,
	}
}

func (hub *Hub) Run() {
    for {
        select {
        case conn := <-hub.Register:
            assert.That(len(hub.Clients)+1 <= 2, "Too many clients", nil)

            id := uint64(len(hub.Clients) + 1)
            ormUser, err := orm.GetUserByID(hub.ctx, id)
            if err != nil {
                log.Println("Error fetching user via ORM:", err)
                break
            }

            dbUser := db.User{
                ID:        ormUser.ID,
                Username:  ormUser.Username,
                Email:     ormUser.Email,
                CreatedAt: ormUser.CreatedAt,
            }

            hub.Clients[&dbUser] = conn
            go msg.ListenForMessages(conn, hub.router, hub.Unregister, func() map[*db.User]*websocket.Conn {
                return hub.Clients
            })

        case conn := <-hub.Unregister:
            assert.That(conn != nil, "Unregistering nil connection", nil)
            hub.router.UnsubscribeAll(conn)

            for user, c := range hub.Clients {
                if c == conn {
                    delete(hub.Clients, user)
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
        instance = newHub(msg.NewMessageRouter())
    })
    return instance
}
