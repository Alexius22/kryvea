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
	pocCollection = "poc"
)

type Poc struct {
	Model           `bson:",inline"`
	Index           int                `json:"index" bson:"index"`
	Type            string             `json:"type" bson:"type"`
	Title           string             `json:"title" bson:"title"`
	Description     string             `json:"description" bson:"description"`
	Content         string             `json:"content" bson:"content"`
	URL             string             `json:"url" bson:"url"`
	VulnerabilityID primitive.ObjectID `json:"vulnerability_id" bson:"vulnerability_id"`
}

type PocIndex struct {
	driver     *Driver
	collection *mongo.Collection
}

func (d *Driver) Poc() *PocIndex {
	return &PocIndex{
		driver:     d,
		collection: d.database.Collection(pocCollection),
	}
}

func (pi PocIndex) init() error {
	_, err := pi.collection.Indexes().CreateOne(
		context.Background(),
		mongo.IndexModel{
			Keys: bson.D{
				{Key: "index", Value: 1},
			},
			Options: options.Index().SetUnique(true),
		},
	)
	return err
}

func (pi *PocIndex) Insert(poc *Poc) error {
	err := pi.driver.Vulnerability().collection.FindOne(context.Background(), bson.M{"_id": poc.VulnerabilityID}).Err()
	if err != nil {
		return err
	}

	poc.Model = Model{
		ID:        primitive.NewObjectID(),
		UpdatedAt: time.Now(),
		CreatedAt: time.Now(),
	}
	_, err = pi.collection.InsertOne(context.Background(), poc)
	return err
}

func (pi *PocIndex) GetByVulnerabilityID(vulnerabilityID primitive.ObjectID) ([]Poc, error) {
	cursor, err := pi.collection.Find(context.Background(), bson.M{"vulnerability_id": vulnerabilityID})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(context.Background())

	var pocs []Poc
	err = cursor.All(context.Background(), &pocs)
	if err != nil {
		return nil, err
	}

	return pocs, nil
}

func (pi *PocIndex) GetByID(pocID primitive.ObjectID) (*Poc, error) {
	var poc Poc
	err := pi.collection.FindOne(context.Background(), bson.M{"_id": pocID}).Decode(&poc)
	if err != nil {
		return nil, err
	}
	return &poc, nil
}
