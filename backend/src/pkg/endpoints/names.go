package endpoints

import (
	"strconv"
	"strings"
)

type EndpointName string

const (
	EndpointNameLogin EndpointName = "/api/login"
	EndpointNameRegister EndpointName = "/api/register"

	EndpointNameRoomsOfUser EndpointName = "/api/user/me/rooms"

	EndpointNameMembersOfRoom EndpointName = "/api/room/:id/members"
)

func (e EndpointName) InsertId(id uint64) string {
	return strings.Replace(string(e), ":id", strconv.Itoa(int(id)), 1)
}
