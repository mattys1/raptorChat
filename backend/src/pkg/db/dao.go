package db

import (
	"database/sql"
	_ "database/sql/driver"
	"sync"
	"os"

	"github.com/go-sql-driver/mysql"

	"github.com/mattys1/raptorChat/src/pkg/assert"
)

var instance *Queries
var once sync.Once

func makeConfig() *mysql.Config {
	cfg := mysql.NewConfig()
	cfg.User = "root"
	cfg.Passwd = os.Getenv("DB_ROOT_PASSWORD")
	cfg.Net = "tcp"
	cfg.DBName = os.Getenv("DB_NAME")
	cfg.Addr = "mysql:3306"
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
		assert.That(err == nil, "Failed to connect to database")
		// defer rdb.Close()

		instance = New(rdb)
	})

	return instance
}
