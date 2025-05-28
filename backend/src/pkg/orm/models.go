package orm

import "time"

type User struct {
	ID        uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	Username  string    `gorm:"size:255;not null;unique" json:"username"`
	Email     string    `gorm:"size:255;not null;unique" json:"email"`
	Password  string    `gorm:"size:255;not null" json:"password"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`
}

type Invite struct {
    ID         uint64     `gorm:"primaryKey;autoIncrement" json:"id"`
    Type       string     `gorm:"size:50;not null" json:"type"`
    State      string     `gorm:"size:50;not null" json:"state"`
    RoomID     *uint64    `gorm:"index"           json:"room_id"`
    IssuerID   uint64     `gorm:"not null;index"  json:"issuer_id"`
    ReceiverID uint64     `gorm:"not null;index"  json:"receiver_id"`
    CreatedAt  time.Time  `gorm:"autoCreateTime"  json:"created_at"`
    UpdatedAt  time.Time  `gorm:"autoUpdateTime"  json:"updated_at"`
}