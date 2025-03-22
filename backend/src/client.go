package main

import (
	"github.com/coder/websocket"
	"github.com/mattys1/raptorChat/src/pkg/db"
)

type Client struct {
	User *db.User `json:"user"`
	// IP string `json:"ip"`
	Connection *websocket.Conn 
}
