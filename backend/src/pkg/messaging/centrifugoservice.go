package messaging

import (
	"context"
	"encoding/json"
	"log/slog"
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
			Key:  os.Getenv("CENTRIFUGO_HTTP_API_KEY"),                 
		}
		instance = &CentrifugoService{
			client: gocent.New(cfg),
		}
	})

	return instance
}

func (cs *CentrifugoService) Publish(
	ctx context.Context, resource *EventResource,
) error {
	data, err := json.Marshal(resource)
	if err != nil {
		return err
	}

	slog.Info("Publishing message", "channel", resource.Channel, "data", string(data))
	err = cs.client.Publish(ctx, resource.Channel, data)
	if err != nil {
		return err
	}

	return nil
}
