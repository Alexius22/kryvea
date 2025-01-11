package db

import (
	"fmt"

	"github.com/Alexius22/kryvea/internal/config"
	"github.com/rs/zerolog/log"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var Database *gorm.DB

func init() {
	dsn := config.Conf.DSN
	dsnString := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%d sslmode=%s TimeZone=%s", dsn.Host, dsn.User, dsn.Password, dsn.DBName, dsn.Port, dsn.SSLMode, dsn.TimeZone)
	var err error
	Database, err = gorm.Open(postgres.Open(dsnString), &gorm.Config{
		AllowGlobalUpdate: true,
	})
	if err != nil {
		log.Fatal().Err(err).Msg("Failed to connect to database")
	}

	Database.AutoMigrate(&Customer{})
}
