package mongo

import (
	"context"
	"time"

	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

const (
	customerCollection = "customer"
)

type Customer struct {
	Model               `bson:",inline"`
	Name                string   `json:"name" bson:"name"`
	Language            string   `json:"language" bson:"language"`
	DefaultCVSSVersions []string `json:"default_cvss_versions" bson:"default_cvss_versions"`
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

func (ci *CustomerIndex) Insert(customer *Customer) (uuid.UUID, error) {
	id, err := uuid.NewRandom()
	if err != nil {
		return uuid.Nil, err
	}

	customer.Model = Model{
		ID:        id,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	_, err = ci.collection.InsertOne(context.Background(), customer)
	if err != nil {
		return uuid.Nil, err
	}

	return customer.ID, err
}

func (ci *CustomerIndex) Update(customerID uuid.UUID, customer *Customer) error {
	filter := bson.M{"_id": customerID}

	update := bson.M{
		"$set": bson.M{
			"updated_at":            time.Now(),
			"name":                  customer.Name,
			"language":              customer.Language,
			"default_cvss_versions": customer.DefaultCVSSVersions,
		},
	}

	_, err := ci.collection.UpdateOne(context.Background(), filter, update)
	return err
}

func (ci *CustomerIndex) Delete(customerID uuid.UUID) error {
	_, err := ci.collection.DeleteOne(context.Background(), bson.M{"_id": customerID})
	if err != nil {
		return err
	}

	// Remove all assessments for the customer
	assessments, err := ci.driver.Assessment().GetByCustomerID(customerID)
	if err != nil {
		return err
	}

	for _, assessment := range assessments {
		if err := ci.driver.Assessment().Delete(assessment.ID); err != nil {
			return err
		}
	}

	// Remove all targets for the customer
	targets, err := ci.driver.Target().GetByCustomerID(customerID)
	if err != nil {
		return err
	}

	for _, target := range targets {
		if err := ci.driver.Target().Delete(target.ID); err != nil {
			return err
		}
	}

	// Remove the customer from the user's list
	filter := bson.M{"customers": customerID}
	update := bson.M{"$pull": bson.M{"customers": customerID}}
	_, err = ci.driver.User().collection.UpdateMany(context.Background(), filter, update)
	return err
}

func (ci *CustomerIndex) GetByID(customerID uuid.UUID) (*Customer, error) {
	var customer Customer
	if err := ci.collection.FindOne(context.Background(), bson.M{"_id": customerID}).Decode(&customer); err != nil {
		return nil, err
	}
	return &customer, nil
}

func (ci *CustomerIndex) GetAll(customerIDs []uuid.UUID) ([]Customer, error) {
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
