package mongo

import (
	"context"

	"github.com/rs/zerolog/log"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type Driver struct {
	client   *mongo.Client
	database *mongo.Database
}

func NewDriver(uri string) (*Driver, error) {
	client, err := mongo.Connect(context.Background(), options.Client().ApplyURI(uri))
	if err != nil {
		return nil, err
	}

	log.Info().Msg("Connected to database")

	return &Driver{
		client:   client,
		database: client.Database("kryvea"),
	}, nil
}
