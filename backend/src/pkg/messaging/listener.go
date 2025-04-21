package messaging

import (
	"context"
	"log"
	"slices"
	"strconv"

	"github.com/coder/websocket"
	"github.com/k0kubun/pp/v3"
	"github.com/mattys1/raptorChat/src/pkg/assert"
	"github.com/mattys1/raptorChat/src/pkg/db"
)

func subscribeAndNotify[T any, U any](
	subscription *Subscription,
	router *MessageRouter,
	conn *websocket.Conn,
	convert func (reference int, dao *db.Queries) ([]U, error),
	qualified func (dao *db.Queries, userId uint64) ([]T, error),
	itemId func (item *T) uint64,
	getClients func () map[*db.User]*websocket.Conn,
) {
	router.Subscribe(MessageEvent(subscription.EventName), subscription.Targets, conn)

	// TODO: actually this should be a map that maps target ID to the items of that target. if this is flattened, then  it's not that important 
	allItems := []U{}
	for i := range subscription.Targets {
		itemsOfTarget, err := convert(subscription.Targets[i], db.GetDao())
		assert.That(err == nil, "Failed retrieving items from target" + strconv.Itoa(subscription.Targets[i]), err)
		allItems = append(allItems, itemsOfTarget...)
	}

	clientId := connToUID(conn, getClients())

	FillSubInOn(router, MessageEvent(subscription.EventName), conn, clientId, db.GetDao(), qualified, itemId)
}

func sliceToSendable[O any, S any](original []O, convert func (org *O) S) []S {
	var sendable []S
	for _, item := range original {
		sendable = append(sendable, convert(&item))
	}
	return sendable
}

func handleSubscription(
	message *message,
	router *MessageRouter,
	conn *websocket.Conn,
	getClients func () map[*db.User]*websocket.Conn,
) {
	subscription, err := GetMessageContents[Subscription](message)
	assert.That(err == nil, "Failed to get subscription from message", err)
	eventName := MessageEvent(subscription.EventName)

	switch eventName {
		case MessageEventChatMessages:
				router.Subscribe(MessageEvent(subscription.EventName), subscription.Targets, conn)

				// TODO: actually this should be a map that maps target ID to the items of that target. if this is flattened, then  it's not that important 
				allMessages := []db.Message{}
				for i := range subscription.Targets {
					messagesInRoom, err := db.GetDao().GetMessagesByRoom(context.TODO(), uint64(subscription.Targets[i]))
					assert.That(err == nil, "Failed retrieving items from target" + strconv.Itoa(subscription.Targets[i]), err)
					allMessages = append(allMessages, messagesInRoom...)
				}

				resource, err := NewResource(MessageEvent(subscription.EventName), allMessages)
				assert.That(err == nil, "Couldn't create resource", err)
				payload, err := NewMessage(MessageTypeCreate, resource)
				assert.That(err == nil, "Failed to create message", err)

				router.SendMessageToSub(MessageEvent(subscription.EventName), conn, payload)
		case MessageEventUsers:
			subscribeAndNotify[db.User](
				subscription,
				router,
				conn,
				func(reference int, dao *db.Queries) ([]*db.UserSendable, error) {
					users, err := dao.GetAllUsers(context.TODO())
					if err != nil {
						return nil, err
					}

					sendableUsers := sliceToSendable(users, func(user *db.User) *db.UserSendable { return user.ToSendable() })
					return sendableUsers, nil
				},
				func(dao *db.Queries, userId uint64) ([]db.User, error) {
					return dao.GetAllUsers(context.TODO())
				},
				func (user *db.User) uint64 { return user.ID },
				getClients,
			)
		case MessageEventRooms:
			subscribeAndNotify[db.Room](
				subscription,
				router,
				conn,
				func(reference int, dao *db.Queries) ([]db.Room, error) {
					if reference == -1 {
						return dao.GetAllRooms(context.TODO())
					}
					// rooms, err := dao.GetAllRooms(context.TODO())
					// if err != nil {
					// 	return nil, err
					// }
					//
					// sendableRooms := sliceToSendable(rooms, func(room *db.Room) *db.RoomSendable { return room.ToSendable() }) 
					result := make([]db.Room, 1)
					result[0], err = dao.GetRoomById(context.TODO(), uint64(reference))
					return result, err  //TODO: make this user dependent also this doesn't work
				},
				func(dao *db.Queries, userId uint64) ([]db.Room, error) {
					return dao.GetRoomsByUser(context.TODO(), userId)		
				},
				func (room *db.Room) uint64 { return room.ID },
				getClients,
			)
	}
}

func createAndSend[T any](
	event MessageEvent,
	resource *Resource,
	router *MessageRouter,
	conn *websocket.Conn,
	matchAuthor func (item *T, user *db.User),
	getQualified func (dao *db.Queries, reference *T) ([]uint64, uint64, error),
	saveInDB func (dao *db.Queries, item *T) (int64, error),
	getClients func () map[*db.User]*websocket.Conn, // TODO: i've mentioned this somewhere else, but this needs to go
) int64 {
	items, err := GetResourceContents[T](resource)
	assert.That(err == nil, "Failed to get resource contents", err)
	assert.That(len(items) == 1, "More than one item sent, unimplemented", nil)

	item := items[0]
	dao := db.GetDao()

	for u, c := range(getClients()) {
		if(c == conn) {
			matchAuthor(&item, u)
		}
	}

	qualified, reference, err := getQualified(dao, &item)
	assert.That(err == nil, "Failed to get qualified ids", err)

	inserted, err := saveInDB(dao, &item)
	assert.That(err == nil, "Failed to save item in DB", err)

	publishResource, err := NewResource(event, []T{item})
	assert.That(err == nil, "Failed to create publish resource", err)
	publish, err := NewMessage(MessageTypeCreate, publishResource)
	assert.That(err == nil, "Failed to create publish message", err)

	go router.Publish(event, publish, qualified, []uint64{reference}, getClients())

	return inserted
}

func handleCreate(
	message *message,
	router *MessageRouter,
	conn *websocket.Conn,
	getClients func () map[*db.User]*websocket.Conn,
) {
	resource, err := GetMessageContents[Resource](message)
	assert.That(err == nil, "Failed to get resource from message", err)
	event := MessageEvent(resource.EventName)

	switch MessageEvent(resource.EventName) {
	case MessageEventChatMessages:
		createAndSend(
			event, resource, router, conn,
			func (item *db.Message, user *db.User) {
				item.SenderID = user.ID
			},
			func (dao *db.Queries, item *db.Message) ([]uint64, uint64, error) {
				usersInRoom, err := dao.GetUsersByRoom(context.TODO(), item.RoomID)
				if err != nil {
					return nil, 0, err
				}
				var roomUserIDs []uint64

				for _, user := range usersInRoom {
					roomUserIDs = append(roomUserIDs, user.ID)
				}

				return roomUserIDs, item.RoomID, nil
			},
			func(dao *db.Queries, item *db.Message) (int64, error) {
				result, err := dao.CreateMessage(context.TODO(), db.CreateMessageParams{
					RoomID: item.RoomID,
					SenderID: item.SenderID,
					Contents: item.Contents,
				})

				if err != nil {
					return 0, err
				}

				id, err := result.LastInsertId()
				return id, err
			},
			getClients,
		)
	case MessageEventRooms:
		// created := createAndSend(
		// 	event, resource, router, conn,
		// 	func(room *db.Room, user *db.User) {
		// 		assert.That(room.Type != db.RoomsTypeDirect, "DMs not implemented", nil)
		// 		room.OwnerID = &user.ID
		// 	},
		// 	func(dao *db.Queries, reference *db.Room) ([]uint64, uint64, error) {
		// 		return []uint64{*reference.OwnerID}, reference.ID, nil
		// 	},
		// 	func(dao *db.Queries, item *db.Room) (int64, error) {
		// 		result, err := dao.CreateRoom(context.TODO(), db.CreateRoomParams {
		// 			OwnerID: item.OwnerID,
		// 			Name: item.Name,
		// 			Type: item.Type,
		// 		})
		// 		if err != nil {	
		// 			return 0, err
		// 		}
		//
		// 		return result.LastInsertId()
		// 	},
		// 	getClients,
		// )

		rooms, err := GetResourceContents[db.Room](resource)
		assert.That(err == nil, "Failed to get resource contents", err)
		assert.That(len(rooms) == 1, "More than one room sent, unimplemented", nil)

		room := rooms[0]
		dao := db.GetDao()

		for u, c := range(getClients()) {
			if(c == conn) {
				room.OwnerID = &u.ID
			}
		}

		inserted, err := dao.CreateRoom(context.TODO(), db.CreateRoomParams{
			OwnerID: room.OwnerID,
			Name: room.Name,
			Type: room.Type,
		})
		roomID, err := inserted.LastInsertId()
		assert.That(err == nil, "Failed to save room in DB", err)


		dao.AddUserToRoom(context.TODO(), db.AddUserToRoomParams{
			UserID: *room.OwnerID,
			RoomID: uint64(roomID),
		})

		room, err = dao.GetRoomById(context.TODO(), uint64(roomID))	
		assert.That(err == nil, "Failed to get room by ID", err)
		resource, err := NewResource(MessageEventRooms, []db.Room{room})
		assert.That(err == nil, "Failed to create resource", err)
		message, err := NewMessage(MessageTypeCreate, resource)
		assert.That(err == nil, "Failed to create message", err)

		router.Publish(MessageEventRooms, message, []uint64{*room.OwnerID}, []uint64{room.ID}, getClients())
	case MessageEventInvites:
		createAndSend(
			event, resource, router, conn,
			func (invite *db.Invite, user *db.User) {
				assert.That(invite.InviteType != db.InvitesInviteTypeFriendship, "Received friendship invite, not implemented", nil)
				assert.That(invite.Status == db.InvitesStatusPending, "Invite must have `pending` status upon creation", nil)
				invite.SenderID = user.ID
			},
			func(dao *db.Queries, invite *db.Invite) ([]uint64, uint64, error) {
				return []uint64{invite.SenderID, invite.RecipientID}, invite.ID, nil
			},
			func(dao *db.Queries, invite *db.Invite) (int64, error) {
				result, err := dao.CreateInvite(context.TODO(), db.CreateInviteParams{
					SenderID: invite.SenderID,
					RecipientID: invite.RecipientID,
					RoomID: invite.RoomID,
					InviteType: invite.InviteType,
					Status: invite.Status,
				})

				if err == nil {
					return 0, err		
				} 			

				return result.LastInsertId()
			},
			getClients,
		)
	default:
		log.Fatal("Unknown event: ", event)
	}
}

func handleUpdate(
	message *message,
	router *MessageRouter,
	conn *websocket.Conn,
	getClients func () map[*db.User]*websocket.Conn, 
) {
	resource, err := GetMessageContents[Resource](message)
	assert.That(err == nil, "Failed to get resource from message", err)
	event := MessageEvent(resource.EventName)

	switch event {
	case MessageEventInvites: {
		updated := updateAndSend(
			resource, router,
			func (dao *db.Queries, invite *db.Invite) ([]uint64, uint64, error) {
				return []uint64{invite.SenderID, invite.RecipientID}, invite.ID, nil
			},
			func (dao *db.Queries, old *db.Invite, updated *db.Invite) (int64, error) {
				assert.That(old.ID == updated.ID, pp.Sprintf("Old item is not the same as updated item: %s and %s", old, updated), nil)
				assert.That(updated.Status == db.InvitesStatusAccepted, "Invite status not accpeted, unimplemented", nil)

				result, err := dao.UpdateInvite(context.TODO(), db.UpdateInviteParams{
					Status: updated.Status,	
					ID: old.ID,
				})
				if err != nil {
					return 0, err
				}

				return result.LastInsertId()	
			},
			getClients,
			)

		// currently handling side effects like this. This should be formalized eventually

		assert.That(len(updated) == 1, "Updated more than one invite, unimplemented", nil)
		newInvite := updated[0]

		roomOfInvite, err := db.GetDao().GetRoomById(context.TODO(), *newInvite.RoomID)
		assert.That(err == nil, "Failed to get room by ID", err)

		if newInvite.Status == db.InvitesStatusRejected {
			log.Println("Invite rejected, not sending")
			return
		}

		resource, err := NewResource(MessageEventRooms, []db.Room{roomOfInvite})
		assert.That(err == nil, "Failed to create resource", err)
		publish, err := NewMessage(MessageTypeUpdate, resource)
		assert.That(err == nil, "Failed to create message", err)

		router.SendMessageToSub(
			MessageEventRooms,
			conn,
			publish,
		)
	}
	}
}

func updateAndSend[T any](
	resource *Resource,
	router *MessageRouter,
	getQualified func (dao *db.Queries, reference *T) ([]uint64, uint64, error),
	updateInDB func (dao *db.Queries, old *T, updated *T) (int64, error),
	getUsers func () map[*db.User]*websocket.Conn,
) []T {
	dao := db.GetDao()

	items, err := GetResourceContents[T](resource)
	assert.That(err != nil, "Couldn't get resource contents", err)

	assert.That(len(items) % 2 == 0, "Updated items list isn't of even size", nil)
	old, updated := items[:len(items) / 2], items[len(items) / 2:]

	var qualified []uint64
	var modified []uint64
	for _, item := range(items) {
		q, m, err := getQualified(dao, &item)
		assert.That(err != nil, "couldn't get qualified users from item: " + pp.Sprint(item), err)
		qualified = append(qualified, q...)
		modified = append(modified, m)
	}

	qualified = slices.Compact(qualified)

	for i := range old {
		updateInDB(dao, &old[i], &updated[i])
	}

	publishResource, err := NewResource(MessageEvent(resource.EventName), resource.Contents)
	assert.That(err == nil, "Couldn't create resource", err)
	publish, err := NewMessage(MessageTypeUpdate, publishResource)
	assert.That(err == nil, "Couldn't create message", err)

	router.Publish(MessageEvent(resource.EventName), publish, qualified, modified, getUsers())
	return updated
}
//TODO: this for now uses connections, but will switch over to clients once they are properly set up
// TODO: also getClients is an unholy abomination
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
			// eventName := subscription.EventName

			handleSubscription(message, router, conn, getClients)
		case MessageTypeUnsubscribe:
			unsubscription, err := GetMessageContents[Subscription](message)

			assert.That(err == nil, "Failed to convert message contents to Unsubscription", nil)

			log.Println("UNSUBSCRIBE:", unsubscription)
			router.Unsubscribe(MessageEvent(unsubscription.EventName), unsubscription.Targets, conn)
		
		case MessageTypeCreate:
			handleCreate(message, router, conn, getClients)
		case MessageTypeUpdate:
			handleUpdate(message, router, conn, getClients)
		default:
			log.Println("Unknown message type: ", message.Type)
		}
	}
}
