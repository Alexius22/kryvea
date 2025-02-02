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
	Model              `bson:",inline"`
	Name               string `json:"name" bson:"name"`
	Language           string `json:"language" bson:"language"`
	DefaultCVSSVersion string `json:"default_cvss_version" bson:"default_cvss_version"`
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
			Keys: bson.D{
				{Key: "name", Value: 1},
			},
			Options: options.Index().SetUnique(true),
		},
	)
	return err
}

func (ci *CustomerIndex) Insert(customer *Customer) (primitive.ObjectID, error) {
	customer.Model = Model{
		ID:        primitive.NewObjectID(),
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}
	_, err := ci.collection.InsertOne(context.Background(), customer)
	return customer.ID, err
}

func (ci *CustomerIndex) GetByID(customerID primitive.ObjectID) (*Customer, error) {
	var customer Customer
	if err := ci.collection.FindOne(context.Background(), bson.M{"_id": customerID}).Decode(&customer); err != nil {
		return nil, err
	}
	return &customer, nil
}

func (ci *CustomerIndex) GetAll(customerIDs []primitive.ObjectID) ([]Customer, error) {
	filter := bson.M{}

	if customerIDs != nil {
		filter["_id"] = bson.M{"$in": customerIDs}
	}

	cursor, err := ci.collection.Find(context.Background(), filter)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(context.Background())

	var customers []Customer
	if err := cursor.All(context.Background(), &customers); err != nil {
		return nil, err
	}

	return customers, nil
}
