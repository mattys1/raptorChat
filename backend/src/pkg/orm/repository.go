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
