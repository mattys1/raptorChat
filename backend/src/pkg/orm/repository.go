package orm

import (
	"context"
	"errors"

	"gorm.io/gorm"
)

var ErrAlreadyExists = errors.New("user already exists")

func CreateUser(ctx context.Context, u *User) error {
	db := GetORM().WithContext(ctx)

	var existing User
	err := db.Where("email = ?", u.Email).First(&existing).Error
	if err == nil {
		return ErrAlreadyExists
	}
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return err
	}

	return db.Create(u).Error
}

func GetUserByEmail(ctx context.Context, email string) (*User, error) {
	var u User
	err := GetORM().WithContext(ctx).Where("email = ?", email).First(&u).Error
	if err != nil {
		return nil, err
	}
	return &u, nil
}

func ListUsers(ctx context.Context) ([]User, error) {
	var users []User
	if err := GetORM().WithContext(ctx).Find(&users).Error; err != nil {
		return nil, err
	}
	return users, nil
}

func DeleteUser(ctx context.Context, id uint64) error {
	return GetORM().WithContext(ctx).Delete(&User{}, id).Error
}

// INVITES

func CreateInvite(ctx context.Context, inv *Invite) error {
    return GetORM().WithContext(ctx).Create(inv).Error
}

func GetInviteByID(ctx context.Context, id uint64) (*Invite, error) {
    var inv Invite
    if err := GetORM().WithContext(ctx).First(&inv, id).Error; err != nil {
        return nil, err
    }
    return &inv, nil
}

func GetInvitesToUser(ctx context.Context, userID uint64) ([]Invite, error) {
    var invs []Invite
    err := GetORM().WithContext(ctx).
        Where("receiver_id = ?", userID).
        Find(&invs).Error
    return invs, err
}

func UpdateInviteState(ctx context.Context, id uint64, state string) error {
    return GetORM().WithContext(ctx).
        Model(&Invite{}).
        Where("id = ?", id).
        Update("state", state).Error
}

// USERS

func GetAllUsers(ctx context.Context) ([]User, error) {
	var users []User
	if err := GetORM().WithContext(ctx).Find(&users).Error; err != nil {
		return nil, err
	}
	return users, nil
}

func GetUserByID(ctx context.Context, id uint64) (*User, error) {
	var u User
	if err := GetORM().WithContext(ctx).First(&u, id).Error; err != nil {
		return nil, err
	}
	return &u, nil
}

func UpdateUser(ctx context.Context, id uint64, updates *User) error {
	return GetORM().WithContext(ctx).
		Model(&User{ID: id}).
		Select("Username", "Email", "Password").
		Updates(updates).Error
}

func UpdateUserAvatar(ctx context.Context, id uint64, url string) error {
	return GetORM().WithContext(ctx).
		Model(&User{}).
		Where("id = ?", id).
		Update("avatar_url", url).Error
}
