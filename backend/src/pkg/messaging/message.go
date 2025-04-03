package messaging

type Message struct {
	Type string `json:"type"`
	Contents any `json:"contents"`
}

type Resource struct {
	EventName string `json:"eventName"`	
	Contents []any `json:"contents"`
}

type Subscription struct {
	EventName string `json:"eventName"`
	Targets []int `json:"targetIds"`
}
