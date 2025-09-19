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

var CustomerPipeline = mongo.Pipeline{
	bson.D{
		{Key: "$lookup", Value: bson.D{
			{Key: "from", Value: "template"},
			{Key: "localField", Value: "_id"},
			{Key: "foreignField", Value: "customer._id"},
			{Key: "as", Value: "templates"},
		}},
	},
	bson.D{
		{Key: "$unset", Value: "templates.customer"},
	},
}

var AllCustomerPipeline = mongo.Pipeline{
	bson.D{
		{Key: "$set", Value: bson.D{
			{Key: "templates", Value: []bson.A{}},
		}},
	},
}

type Customer struct {
	Model     `bson:",inline"`
	Name      string     `json:"name" bson:"name"`
	Language  string     `json:"language" bson:"language"`
	Templates []Template `json:"templates" bson:"templates"`
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

	return customer.ID, nil
}

func (ci *CustomerIndex) Update(customerID uuid.UUID, customer *Customer) error {
	filter := bson.M{"_id": customerID}

	update := bson.M{
		"$set": bson.M{
			"updated_at": time.Now(),
			"name":       customer.Name,
			"language":   customer.Language,
		},
	}

	_, err := ci.collection.UpdateOne(context.Background(), filter, update)
	return err
}

func (ci *CustomerIndex) Delete(customerID uuid.UUID) error {
	// Remove the customer from the user's list
	filter := bson.M{"customers._id": customerID}
	update := bson.M{"$pull": bson.M{"customers": bson.M{"_id": customerID}}}
	_, err := ci.driver.User().collection.UpdateMany(context.Background(), filter, update)
	if err != nil {
		return err
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

	// Remove all templates for the customer
	templates, err := ci.driver.Template().GetByCustomerID(customerID)
	if err != nil {
		return err
	}

	for _, template := range templates {
		if err := ci.driver.Template().Delete(template.ID); err != nil {
			return err
		}
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

	// Delete the customer
	_, err = ci.collection.DeleteOne(context.Background(), bson.M{"_id": customerID})
	return err
}

func (ci *CustomerIndex) GetByID(customerID uuid.UUID) (*Customer, error) {
	var customer Customer
	if err := ci.collection.FindOne(context.Background(), bson.M{"_id": customerID}).Decode(&customer); err != nil {
		return nil, err
	}
	return &customer, nil
}

func (ci *CustomerIndex) GetByIDPipeline(customerID uuid.UUID) (*Customer, error) {
	pipeline := append(CustomerPipeline,
		bson.D{{Key: "$match", Value: bson.M{"_id": customerID}}},
		bson.D{{Key: "$limit", Value: 1}},
	)

	cursor, err := ci.collection.Aggregate(context.Background(), pipeline)
	if err != nil {
		ci.driver.logger.Error().Err(err).Msg("Failed to aggregate customer by ID")
		return nil, err
	}
	defer cursor.Close(context.Background())

	var customer Customer
	if cursor.Next(context.Background()) {
		if err := cursor.Decode(&customer); err != nil {
			ci.driver.logger.Error().Err(err).Msg("Failed to decode customer")
			return nil, err
		}

		return &customer, nil
	}

	return nil, mongo.ErrNoDocuments
}

func (ci *CustomerIndex) GetAll(customerIDs []uuid.UUID) ([]Customer, error) {
	pipeline := AllCustomerPipeline
	if customerIDs != nil {
		pipeline = append(pipeline, bson.D{
			{Key: "$match", Value: bson.M{
				"_id": bson.M{"$in": customerIDs},
			}},
		})
	}

	cursor, err := ci.collection.Aggregate(context.Background(), pipeline)
	if err != nil {
		return []Customer{}, err
	}
	defer cursor.Close(context.Background())

	customers := []Customer{}
	if err := cursor.All(context.Background(), &customers); err != nil {
		return []Customer{}, err
	}

	return customers, nil
}
