package db

import (
	"database/sql"
	_ "database/sql/driver"

	// "fmt"
	"os"
	"sync"

	"github.com/go-sql-driver/mysql"

	"github.com/mattys1/raptorChat/src/pkg/assert"
)

var instance *Queries
var once sync.Once

func makeConfig() *mysql.Config {
	var addr string
	if os.Getenv("IS_DOCKER") == "1" {
		addr = "mysql:3306"
	} else {
		addr = "localhost:3307"
	}

	cfg := mysql.NewConfig()
	cfg.User = "root"
	cfg.Passwd = os.Getenv("DB_ROOT_PASSWORD")
	cfg.Net = "tcp"
	cfg.DBName = os.Getenv("DB_NAME")
	cfg.Addr = addr
	cfg.Params = map[string]string{
		"parseTime": "true",
		// "ssl-verify-server-cert": "false",
	}

	return cfg
}

func GetDao() *Queries {
	once.Do(func() {
		cfg := makeConfig()

		rdb, err := sql.Open("mysql", cfg.FormatDSN())
		assert.That(err == nil, "Failed to connect to database", err)
		// defer rdb.Close()

		instance = New(rdb)
	})

	return instance
}
