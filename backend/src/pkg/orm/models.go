package orm

import (
	"time"
)

// CallsStatus enum type
type CallsStatus string

const (
	CallsStatusActive    CallsStatus = "active"
	CallsStatusCompleted CallsStatus = "completed"
	CallsStatusRejected  CallsStatus = "rejected"
)

// Call represents a voice/video call
type Call struct {
	ID               uint64      `gorm:"primaryKey" json:"id"`
	RoomID           uint64      `gorm:"index" json:"room_id"`
	Status           CallsStatus `gorm:"type:enum('active','completed','rejected');default:active" json:"status"`
	CreatedAt        time.Time   `gorm:"autoCreateTime" json:"created_at"`
	EndedAt		  	 *time.Time  `json:"ended_at"` 
	ParticipantCount uint32      `gorm:"default:1" json:"participant_count"`
	PeakParticipantCount uint32  `gorm:"default:1" json:"peak_participant_count"` 
	
	// Relationships
	Room         *Room             `gorm:"foreignKey:RoomID" json:"-"`
	Participants []CallParticipant `gorm:"foreignKey:CallID" json:"-"`
}

// TableName specifies the table name for Call model
func (Call) TableName() string {
	return "calls"
}

// CallParticipant represents a user participating in a call
type CallParticipant struct {
	CallID   uint64    `gorm:"primaryKey" json:"call_id"`
	UserID   uint64    `gorm:"primaryKey" json:"user_id"`
	JoinedAt time.Time `gorm:"autoCreateTime" json:"joined_at"`
	
	// Relationships
	Call *Call `gorm:"foreignKey:CallID" json:"-"`
	User *User `gorm:"foreignKey:UserID" json:"-"`
}

// TableName specifies the table name for CallParticipant model
func (CallParticipant) TableName() string {
	return "call_participants"
}

// InvitesState enum type
type InvitesState string

const (
	InvitesStatePending  InvitesState = "pending"
	InvitesStateAccepted InvitesState = "accepted"
	InvitesStateDeclined InvitesState = "declined"
)

// InvitesType enum type
type InvitesType string

const (
	InvitesTypeDirect InvitesType = "direct"
	InvitesTypeGroup  InvitesType = "group"
)

// Invite represents an invitation
type Invite struct {
	ID         uint64       `gorm:"primaryKey" json:"id"`
	Type       InvitesType  `gorm:"type:enum('direct','group')" json:"type"`
	State      InvitesState `gorm:"type:enum('pending','accepted','declined');default:pending" json:"state"`
	RoomID     *uint64      `gorm:"index" json:"room_id,omitempty"`
	IssuerID   uint64       `gorm:"index" json:"issuer_id"`
	ReceiverID uint64       `gorm:"index" json:"receiver_id"`
	
	// Relationships
	Room     *Room `gorm:"foreignKey:RoomID" json:"-"`
	Issuer   *User `gorm:"foreignKey:IssuerID" json:"-"`
	Receiver *User `gorm:"foreignKey:ReceiverID" json:"-"`
}

// TableName specifies the table name for Invite model
func (Invite) TableName() string {
	return "invites"
}

// RoomsType enum type
type RoomsType string

const (
	RoomsTypeDirect RoomsType = "direct"
	RoomsTypeGroup  RoomsType = "group"
)

// Room represents a chat room
type Room struct {
	ID          uint64    `gorm:"primaryKey" json:"id"`
	Name        *string   `json:"name,omitempty"`
	OwnerID     *uint64   `gorm:"index" json:"owner_id,omitempty"`
	Type        RoomsType `gorm:"type:enum('direct','group')" json:"type"`
	MemberCount *int32    `gorm:"default:0" json:"member_count,omitempty"`
	
	// Relationships
	Owner    *User           `gorm:"foreignKey:OwnerID" json:"-"`
	Messages []Message       `gorm:"foreignKey:RoomID" json:"-"`
	Users    []UsersRoom     `gorm:"foreignKey:RoomID" json:"-"`
	Roles    []RoomsUsersRole `gorm:"foreignKey:RoomID" json:"-"`
	Calls    []Call          `gorm:"foreignKey:RoomID" json:"-"`
	Invites  []Invite        `gorm:"foreignKey:RoomID" json:"-"`
}

// TableName specifies the table name for Room model
func (Room) TableName() string {
	return "rooms"
}

// Message represents a chat message
type Message struct {
	ID        uint64     `gorm:"primaryKey" json:"id"`
	SenderID  uint64     `gorm:"index" json:"sender_id"`
	RoomID    uint64     `gorm:"index" json:"room_id"`
	Contents  string     `json:"contents"`
	CreatedAt time.Time  `gorm:"autoCreateTime" json:"created_at"`
	IsDeleted *bool      `gorm:"default:0" json:"is_deleted,omitempty"`
	DeletedAt *time.Time `json:"deleted_at,omitempty"`
	
	// Relationships
	Sender *User `gorm:"foreignKey:SenderID" json:"-"`
	Room   *Room `gorm:"foreignKey:RoomID" json:"-"`
}

// TableName specifies the table name for Message model
func (Message) TableName() string {
	return "messages"
}

// Friendship represents a relationship between two users
type Friendship struct {
	ID        uint64     `gorm:"primaryKey" json:"id"`
	FirstID   uint64     `gorm:"index" json:"first_id"`
	SecondID  uint64     `gorm:"index" json:"second_id"`
	DmID      uint64     `gorm:"index" json:"dm_id"`
	CreatedAt *time.Time `json:"created_at,omitempty"`
	
	// Relationships
	First  *User `gorm:"foreignKey:FirstID" json:"-"`
	Second *User `gorm:"foreignKey:SecondID" json:"-"`
	Dm     *Room `gorm:"foreignKey:DmID" json:"-"` // Direct Message Room
}

// TableName specifies the table name for Friendship model
func (Friendship) TableName() string {
	return "friendships"
}

// Permission represents a permission in the system
type Permission struct {
	ID   uint64 `gorm:"primaryKey" json:"id"`
	Name string `json:"name"`
	
	// Relationships
	Roles []RolesPermission `gorm:"foreignKey:PermissionID" json:"-"`
}

// TableName specifies the table name for Permission model
func (Permission) TableName() string {
	return "permissions"
}

// Role represents a user role in the system
type Role struct {
	ID   uint64 `gorm:"primaryKey" json:"id"`
	Name string `json:"name"`
	
	// Relationships
	Permissions []RolesPermission `gorm:"foreignKey:RoleID" json:"-"`
	Users       []UsersRole       `gorm:"foreignKey:RoleID" json:"-"`
	RoomUsers   []RoomsUsersRole  `gorm:"foreignKey:RoleID" json:"-"`
}

// TableName specifies the table name for Role model
func (Role) TableName() string {
	return "roles"
}

// RolesPermission represents a many-to-many relationship between roles and permissions
type RolesPermission struct {
	RoleID       uint64 `gorm:"primaryKey" json:"role_id"`
	PermissionID uint64 `gorm:"primaryKey" json:"permission_id"`
	
	// Relationships
	Role       *Role       `gorm:"foreignKey:RoleID" json:"-"`
	Permission *Permission `gorm:"foreignKey:PermissionID" json:"-"`
}

// TableName specifies the table name for RolesPermission model
func (RolesPermission) TableName() string {
	return "roles_permissions"
}

// RoomsUsersRole represents a user's role in a specific room
type RoomsUsersRole struct {
	RoomID uint64 `gorm:"primaryKey" json:"room_id"`
	UserID uint64 `gorm:"primaryKey" json:"user_id"`
	RoleID uint64 `gorm:"primaryKey" json:"role_id"`
	
	// Relationships
	Room *Room `gorm:"foreignKey:RoomID" json:"-"`
	User *User `gorm:"foreignKey:UserID" json:"-"`
	Role *Role `gorm:"foreignKey:RoleID" json:"-"`
}

// TableName specifies the table name for RoomsUsersRole model
func (RoomsUsersRole) TableName() string {
	return "rooms_users_roles"
}

// User represents a user in the system
type User struct {
	ID        uint64    `gorm:"primaryKey" json:"id"`
	Username  string    `gorm:"uniqueIndex" json:"username"`
	Email     string    `gorm:"uniqueIndex" json:"email"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`
	Password  string    `json:"-"` // Don't expose in JSON
	AvatarUrl *string   `gorm:"default:''" json:"avatar_url,omitempty"`
	
	// Relationships
	Rooms         []UsersRoom       `gorm:"foreignKey:UserID" json:"-"`
	Roles         []UsersRole       `gorm:"foreignKey:UserID" json:"-"`
	RoomRoles     []RoomsUsersRole  `gorm:"foreignKey:UserID" json:"-"`
	SentMessages  []Message         `gorm:"foreignKey:SenderID" json:"-"`
	SentInvites   []Invite          `gorm:"foreignKey:IssuerID" json:"-"`
	ReceivedInvites []Invite        `gorm:"foreignKey:ReceiverID" json:"-"`
	CallParticipations []CallParticipant `gorm:"foreignKey:UserID" json:"-"`
}

// TableName specifies the table name for User model
func (User) TableName() string {
	return "users"
}

// UsersRole represents a user's global roles
type UsersRole struct {
	UserID uint64 `gorm:"primaryKey" json:"user_id"`
	RoleID uint64 `gorm:"primaryKey" json:"role_id"`
	
	// Relationships
	User *User `gorm:"foreignKey:UserID" json:"-"`
	Role *Role `gorm:"foreignKey:RoleID" json:"-"`
}

// TableName specifies the table name for UsersRole model
func (UsersRole) TableName() string {
	return "users_roles"
}

// UsersRoom represents a user's membership in a room
type UsersRoom struct {
	UserID uint64 `gorm:"primaryKey" json:"user_id"`
	RoomID uint64 `gorm:"primaryKey" json:"room_id"`
	
	// Relationships
	User *User `gorm:"foreignKey:UserID" json:"-"`
	Room *Room `gorm:"foreignKey:RoomID" json:"-"`
}

// TableName specifies the table name for UsersRoom model
func (UsersRoom) TableName() string {
	return "users_rooms"
}

