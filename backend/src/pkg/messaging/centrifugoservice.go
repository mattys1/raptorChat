package messaging

import (
	"context"
	"encoding/json"
	"os"
	"sync"

	"github.com/centrifugal/gocent"
)

type CentrifugoService struct {
	client *gocent.Client
}

var instance *CentrifugoService
var once sync.Once

func GetCentrifugoService() *CentrifugoService {
	once.Do(func() {
		var addr string
		if os.Getenv("IS_DOCKER") == "1" {
			addr = "http://centrifugo:8000/api"
		} else {
			addr = "http://localhost:8000/api"
		}
		cfg := gocent.Config{
			Addr: addr,  
			Key:  "http_secret",                 
		}
		instance = &CentrifugoService{
			client: gocent.New(cfg),
		}
	})

	return instance
}

//TODO: there should probably be a way to send an event not tied to a resource
func (cs *CentrifugoService) Publish(
	ctx context.Context, channel string, resource *EventResource,
) error {
	data, err := json.Marshal(resource)
	if err != nil {
		return err
	}

	err = cs.client.Publish(ctx, channel, data)
	if err != nil {
		return err
	}

	return nil
}
