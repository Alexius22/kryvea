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
			Keys: bson.D{
				{Key: "name", Value: 1},
			},
			Options: options.Index().SetUnique(true),
		},
	)
	return err
}

func (ci *CustomerIndex) Insert(customer *Customer) error {
	customer.Model = Model{
		ID:        primitive.NewObjectID(),
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}
	_, err := ci.collection.InsertOne(context.Background(), customer)
	return err
}

func (ci *CustomerIndex) GetByID(customerID primitive.ObjectID) (*Customer, error) {
	var customer Customer
	if err := ci.collection.FindOne(context.Background(), bson.M{"_id": customerID}).Decode(&customer); err != nil {
		return nil, err
	}
	return &customer, nil
}

func (ci *CustomerIndex) GetByIDList(customerIDs []primitive.ObjectID) ([]Customer, error) {
	if len(customerIDs) == 0 {
		return nil, nil
	}

	cursor, err := ci.collection.Find(context.Background(), bson.M{"_id": bson.M{"$in": customerIDs}})
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

func (ci *CustomerIndex) GetAll() ([]Customer, error) {
	cursor, err := ci.collection.Find(context.Background(), bson.M{})
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
