package main

import (
	"github.com/coder/websocket"
)

type Client struct {
	Id int `json:"id"`
	IP string `json:"ip"`
	Connection *websocket.Conn 
}
