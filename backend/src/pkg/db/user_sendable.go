package db
import (
	"time"
)

type UserSendable struct {
	ID        uint64    `json:"id"`
	Username  string    `json:"username"`
	Email     string    `json:"email"`
	CreatedAt time.Time `json:"created_at"`
}

func (u *User) ToSendable() *UserSendable {
	return &UserSendable{
		ID:        u.ID,
		Username:  u.Username,
		Email:     u.Email,
		CreatedAt: u.CreatedAt,
	}
}
