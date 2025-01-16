package mongo

import (
	"context"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

const (
	customerCollection = "customer"
)

type Customer struct {
	model
	Name               string `json:"name" bson:"name"`
	Language           string `json:"language" bson:"language"`
	DefaultCVSSVersion int    `json:"default_cvss_version" bson:"default_cvss_version"`
}

type CustomerIndex struct {
	driver     *Driver
	collection *mongo.Collection
}

func (d *Driver) Customer() *CustomerIndex {
	return &CustomerIndex{
		driver:     d,
		collection: d.database.Collection(customerCollection),
	}
}

func (ci CustomerIndex) init() error {
	_, err := ci.collection.Indexes().CreateOne(
		context.Background(),
		mongo.IndexModel{
			Keys: bson.M{
				"name": 1,
			},
			Options: options.Index().SetUnique(true),
		},
	)
	return err
}

func (ci *CustomerIndex) Insert(customer *Customer) error {
	customer.model = model{
		ID:        primitive.NewObjectID(),
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}
	_, err := ci.collection.InsertOne(context.Background(), customer)
	return err
}

func (ci *CustomerIndex) GetByID(customerID primitive.ObjectID) (*Customer, error) {
	// TODO
	return nil, nil
}

func (ci *CustomerIndex) GetAll() ([]Customer, error) {
	// TODO
	return nil, nil
}
