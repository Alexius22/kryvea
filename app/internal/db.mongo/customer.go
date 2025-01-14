package dbmongo

import (
	"context"

	"github.com/rs/zerolog/log"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type Customer struct {
	Model
	Name               string `json:"name" bson:"name"`
	Lang               string `json:"lang" bson:"lang"`
	DefaultCVSSVersion int    `json:"default_cvss_version" bson:"default_cvss_version"`
}

var customerCollection *mongo.Collection

func init() {
	customerCollection = database.Collection("customer")

	_, err := customerCollection.Indexes().CreateOne(context.Background(), mongo.IndexModel{
		Keys: bson.M{
			"name": 1,
		},
		Options: options.Index().SetUnique(true),
	})
	if err != nil {
		log.Fatal().Err(err).Msg("Failed to create index")
	}

	log.Info().Msg("Created index for customer collection")
}

func AddCustomer(customer Customer) error {
	_, err := customerCollection.InsertOne(context.Background(), customer)
	if err != nil {
		return err
	}
	return nil
}
