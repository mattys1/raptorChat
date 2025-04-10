package messaging

import (
	"context"
	"log"
	"strconv"

	"github.com/coder/websocket"
	"github.com/mattys1/raptorChat/src/pkg/assert"
	"github.com/mattys1/raptorChat/src/pkg/db"
)

//TODO: this for now uses connections, but will switch over to clients once they are properly set up
// TODO: really have to put this somewhere else
func ListenForMessages(conn *websocket.Conn, router *MessageRouter, unregisterConn chan *websocket.Conn, getClients func () map[*db.User]*websocket.Conn) {
	defer func() {
		unregisterConn <- conn
		conn.Close(websocket.StatusNormalClosure, "Connection closing")
	}()

	for {
		mType, contents, err := conn.Read(context.Background())
		if err != nil {
			log.Println("Connection closed: ", err)
			break
		}

		log.Println("Message received: ", string(contents))
		assert.That(mType == websocket.MessageText, "Message arrived that's not text", nil)

		message, err := GetMessageFromJSON(contents) 
		assert.That(err == nil, "Failed to unmarshal message", err)
		log.Println("Unmarshalled message: ", message)

		switch MessageType(message.Type) {
		case MessageTypeSubscribe:
			log.Println("Message contents pre unmarshall: ", message.Contents)
			subscription, err := GetMessageContents[Subscription](message)
			assert.That(err == nil, "Failed to get subscription from message", err)

			log.Println("Subscription: ", subscription)
			eventName := subscription.EventName

			switch MessageEvent(eventName) {
			case MessageEventChatMessages:
				router.Subscribe(MessageEvent(eventName), subscription.Targets, conn)

				subscription, err := GetMessageContents[Subscription](message)
				assert.That(err == nil, "Failed to get subscription from message", err)
				// TODO: so, we need to implement a query to get all messages for a specific room, then we just send it out, pray that everything works, and then implement sending of messages, fuck editing and deleting
				dao := db.GetDao()

				messagesInAllRooms := make([][]db.Message, len(subscription.Targets))
				for i := range messagesInAllRooms {
					messagesInRoom, err := dao.GetMessagesByRoom(context.TODO(), uint64(subscription.Targets[i]))
					assert.That(err == nil, "Failed retrieving messages from room" + strconv.Itoa(subscription.Targets[i]), err)

					messagesInAllRooms[i] = messagesInRoom
				}

				resource, err := NewResource(MessageEvent(eventName), messagesInAllRooms)
				assert.That(err == nil, "Couldn't create resource", err)

				payload, err := NewMessage(MessageTypeCreate, resource)

				router.FillSubInOn(MessageEvent(eventName), conn, payload)

			case MessageEventUsers:
				router.Subscribe(MessageEventUsers, subscription.Targets, conn)

				users, err := db.GetDao().GetAllUsers(context.TODO())
				assert.That(err == nil, "Failed to get users from db", err)

				var sendableUsers []any
				for _, user := range users {
					sendableUsers = append(sendableUsers, user.ToSendable())	
				}

				resource, err := NewResource(MessageEventUsers, sendableUsers)
				assert.That(err == nil, "Failed to create resource", err)

				payload, err := NewMessage(MessageTypeCreate, resource)

				assert.That(err == nil, "Failed to create message", err)

				go router.FillSubInOn(
					MessageEventUsers,
					conn,
					payload,
				)
			case MessageEventRooms:
				log.Println("Chat subscription")
				router.Subscribe(MessageEvent(eventName), subscription.Targets, conn)
				rooms, err := db.GetDao().GetAllRooms(context.TODO())
				assert.That(err == nil, "Failed to get rooms from db", err)

				sendableRooms := make([]any, len(rooms))
				for i, room := range rooms {
					sendableRooms[i] = room.ToSendable()
				}

				log.Println("Publishing rooms", sendableRooms)

				resource, err := NewResource(MessageEventRooms, sendableRooms)
				payload, err := NewMessage(MessageTypeCreate, resource)

				assert.That(err == nil, "Failed to create message", err)

				router.FillSubInOn(
					MessageEventRooms,
					conn,
					payload,
				)
			}
			
		case MessageTypeUnsubscribe:
			unsubscription, err := GetMessageContents[Subscription](message)

			assert.That(err == nil, "Failed to convert message contents to Unsubscription", nil)

			log.Println("UNSUBSCRIBE:", unsubscription)
			router.Unsubscribe(MessageEvent(unsubscription.EventName), unsubscription.Targets, conn)
		
		case MessageTypeCreate:
			resource, err := GetMessageContents[Resource](message)
			assert.That(err == nil, "Couldnt parse create message", err)
			event := MessageEvent(resource.EventName)

			switch event {
			case MessageEventChatMessages:
				log.Println("Chat message sent", resource.Contents)
				chatMessages, err := GetResourceContents[db.Message](resource)
				assert.That(err == nil, "Couldnt convert contents to db.Message", err)
				assert.That(len(chatMessages) == 1, "More than one message sent, unimplemented", nil)

				chatMessage := chatMessages[0]

				assert.That(chatMessage.ID == 0, "Message sent with a known ID", nil)
				assert.That(chatMessage.SenderID == 0, "Message sent with a known sender ID", nil)

				dao := db.GetDao()

				for u, c := range(getClients()) {
					if(c == conn) {
						chatMessage.SenderID = u.ID
					}
				}
				log.Println("Chat message sender ID: ", chatMessage.SenderID)

				usersInRoom, err := dao.GetUsersByRoom(context.TODO(), chatMessage.SenderID) 
				assert.That(err == nil, "Can't get users in room", err)
				log.Println("Users in room: ", usersInRoom)

				var roomUserIDs []uint64

				for _, user := range usersInRoom {
					roomUserIDs = append(roomUserIDs, user.ID)
				}

				dao.CreateMessage(context.TODO(), db.CreateMessageParams{
					RoomID: chatMessage.RoomID,	
					SenderID: chatMessage.SenderID,
					Contents: chatMessage.Contents,
				})

				publishResource, err := NewResource(
					MessageEventChatMessages,
					[]db.Message{chatMessage},
				)

				assert.That(err == nil, "Failed to create publish resource", err)

				publish, err := NewMessage(MessageTypeCreate, publishResource)

				go router.Publish(event, publish, roomUserIDs, getClients())
			}
			

		default:
			log.Println("Unknown message type: ", message.Type)
		}
	}
}
