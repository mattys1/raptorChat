// backend/src/pkg/orm/connection.go
package orm

import (
	"log"
	"os"
	"sync"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var (
	instance *gorm.DB
	once     sync.Once
)

// This returns a singleton GORM to DB connection, with only user for now
func GetORM() *gorm.DB {
	once.Do(func() {
		var dsn string
		if os.Getenv("IS_DOCKER") == "1" {
			dsn = "root:" + os.Getenv("DB_ROOT_PASSWORD") +
				"@tcp(mysql:3306)/" + os.Getenv("DB_NAME") +
				"?charset=utf8mb4&parseTime=True&loc=Local"
		} else {
			dsn = "root:" + os.Getenv("DB_ROOT_PASSWORD") +
				"@tcp(localhost:3307)/" + os.Getenv("DB_NAME") +
				"?charset=utf8mb4&parseTime=True&loc=Local"
		}
		db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
		if err != nil {
			log.Fatalf("ORM failed to connect: %v", err)
		}
		if err := db.AutoMigrate(&User{}); err != nil {
			log.Fatalf("ORM failed auto-migrate: %v", err)
		}
		instance = db
	})
	return instance
}
