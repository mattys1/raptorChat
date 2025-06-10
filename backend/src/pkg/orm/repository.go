package orm

import (
	"context"
	"errors"
	"time"

	"gorm.io/gorm"
)

var ErrAlreadyExists = errors.New("user already exists")

func CreateUser(ctx context.Context, u *User) error {
	return GetORM().WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		var existing User
		err := tx.Where("email = ?", u.Email).First(&existing).Error
		if err == nil {
			return ErrAlreadyExists
		}
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return err
		}

		return tx.Create(u).Error
	})
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
	return GetORM().WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		return tx.Delete(&User{}, id).Error
	})
}

// INVITES

func CreateInvite(ctx context.Context, inv *Invite) error {
    return GetORM().WithContext(ctx).Transaction(func(tx *gorm.DB) error {
        return tx.Create(inv).Error
    })
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
    return GetORM().WithContext(ctx).Transaction(func(tx *gorm.DB) error {
        return tx.Model(&Invite{}).
            Where("id = ?", id).
            Update("state", state).Error
    })
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
	return GetORM().WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		return tx.Model(&User{ID: id}).
			Select("Username", "Email", "Password").
			Updates(updates).Error
	})
}

func UpdateUserAvatar(ctx context.Context, id uint64, url string) error {
	return GetORM().WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		return tx.Model(&User{}).
			Where("id = ?", id).
			Update("avatar_url", url).Error
	})
}
func CreateCall(ctx context.Context, c *Call) (*Call, error) {
	var call = c
	err := GetORM().WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		return tx.Create(call).Error
	})
	return call, err
}

func GetCallsByRoomID(ctx context.Context, roomID uint64) ([]Call, error) {
	var calls []Call
	err := GetORM().WithContext(ctx).Where("room_id = ?", roomID).Find(&calls).Error
	if err != nil {
		return nil, err
	}
	return calls, nil
}

func GetCallsByUserID(ctx context.Context, userID uint64) ([]Call, error) {
	var calls []Call
	err := GetORM().WithContext(ctx).
		Joins("JOIN call_participants ON calls.id = call_participants.call_id").
		Where("call_participants.user_id = ?", userID).
		Find(&calls).Error
	if err != nil {
		return nil, err
	}
	return calls, nil
}

func AddUserToCall(ctx context.Context, callID, userID uint64) error {
	return GetORM().WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		newParticipant := CallParticipant{UserID: userID, CallID: callID}
		if err := tx.Create(&newParticipant).Error; err != nil {
			return err
		}

		return tx.Model(&Call{}).Where("id = ?", callID).
			UpdateColumn("participant_count", gorm.Expr("participant_count + 1")).Error
	})
}

func RemoveUserFromCall(ctx context.Context, callID, userID uint64) error {
	return GetORM().WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		return tx.Model(&Call{}).Where("id = ?", callID).
			UpdateColumn("participant_count", gorm.Expr("participant_count - 1")).Error
	})
}

func CompleteCall(ctx context.Context, callID uint64) (*Call, error) {
	var call Call
	err := GetORM().WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		if err := tx.Model(&Call{}).Where("id = ?", callID).
			Updates(map[string]any{
				"status":   CallsStatusCompleted,
				"ended_at": time.Now().UTC(),
			}).Error; err != nil {
			return err
		}
		
		return tx.Preload("Participants").First(&call, callID).Error
	})
	return &call, err
}

func AssignRoleToUser(ctx context.Context, userID uint64, roleName string) error {
    return GetORM().WithContext(ctx).Transaction(func(tx *gorm.DB) error {
        var role Role
        if err := tx.First(&role, "name = ?", roleName).Error; err != nil {
            return err
        }
        ur := UsersRole{UserID: userID, RoleID: role.ID}
        return tx.FirstOrCreate(&ur, ur).Error
    })
}

