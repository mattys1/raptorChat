package messaging

type RequestBody struct {
	IssuerId uint64 `json:"issuer_id"`
	Event MessageEvent `json:"event"`
	Data []byte `json:"data"`
}
