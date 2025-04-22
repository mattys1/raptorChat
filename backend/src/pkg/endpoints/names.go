package endpoints

import (
	"internal/itoa"
	"strings"

	"github.com/mattys1/raptorChat/src/pkg/assert"
)

type EndpointName string

const (
	EndpointNameLogin EndpointName = "/api/login"
	EndpointNameRegister EndpointName = "/api/register"

	EndpointNameRoomsOfUser EndpointName = "/api/user/:id/rooms"
)

func (e EndpointName) InsertId(id uint64) string {
	replaceables := map[EndpointName]string{
		EndpointNameRoomsOfUser: "id",
	}

	toReplace, success := replaceables[e]
	assert.That(success, "EndpointName " + string(e) + "not found in replaceables", nil)

	return strings.Replace(string(e), ":" + toReplace, itoa.Itoa(int(id)), 1)
}
