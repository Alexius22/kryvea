package dbmongo

import (
	"context"

	"github.com/Alexius22/kryvea/internal/config"
	"github.com/rs/zerolog/log"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var client *mongo.Client
var database *mongo.Database

func init() {
	uri := config.GetMongoConfig()
	var err error
	client, err = mongo.Connect(context.Background(), options.Client().ApplyURI(uri))
	if err != nil {
		log.Fatal().Err(err).Msg("Failed to connect to database")
	}

	database = client.Database("kryvea")

	log.Info().Msg("Connected to database")
}
