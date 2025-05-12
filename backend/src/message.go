package main

type Message struct {
	Sender *Client `json:"sender"`
	Content string `json:"content"`
}
