package mongo

import (
	"context"
	"encoding/base64"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

const (
	pocCollection = "poc"
)

type Poc struct {
	Model           `bson:",inline"`
	Index           int           `json:"index" bson:"index"`
	Type            string        `json:"type" bson:"type"`
	Description     string        `json:"description" bson:"description"`
	URI             string        `json:"uri,omitempty" bson:"uri,omitempty"`
	Request         string        `json:"request,omitempty" bson:"request,omitempty"`
	Response        string        `json:"response,omitempty" bson:"response,omitempty"`
	ImageID         bson.ObjectID `json:"image_id,omitempty" bson:"image_id,omitempty"`
	ImageData       string        `json:"image_data,omitempty" bson:"image_data,omitempty"`
	ImageCaption    string        `json:"image_caption,omitempty" bson:"image_caption,omitempty"`
	TextLanguage    string        `json:"text_language,omitempty" bson:"text_language,omitempty"`
	TextData        string        `json:"text_data,omitempty" bson:"text_data,omitempty"`
	VulnerabilityID bson.ObjectID `json:"vulnerability_id" bson:"vulnerability_id"`
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
				{Key: "vulnerability_id", Value: 1},
			},
			Options: options.Index().SetUnique(true),
		},
	)
	return err
}

func (pi *PocIndex) Insert(poc *Poc) (bson.ObjectID, error) {
	err := pi.driver.Vulnerability().collection.FindOne(context.Background(), bson.M{"_id": poc.VulnerabilityID}).Err()
	if err != nil {
		return bson.NilObjectID, err
	}

	poc.Model = Model{
		ID:        bson.NewObjectID(),
		UpdatedAt: time.Now(),
		CreatedAt: time.Now(),
	}
	_, err = pi.collection.InsertOne(context.Background(), poc)
	return poc.ID, err
}

func (pi *PocIndex) Update(ID bson.ObjectID, poc *Poc) error {
	filter := bson.M{"_id": ID}

	update := bson.M{
		"$set": bson.M{},
	}

	if poc.Index != 0 {
		update["$set"].(bson.M)["index"] = poc.Index
	}

	if poc.Type != "" {
		update["$set"].(bson.M)["type"] = poc.Type
	}

	if poc.Description != "" {
		update["$set"].(bson.M)["description"] = poc.Description
	}

	if poc.URI != "" {
		update["$set"].(bson.M)["uri"] = poc.URI
	}

	if poc.Request != "" {
		update["$set"].(bson.M)["request"] = poc.Request
	}

	if poc.Response != "" {
		update["$set"].(bson.M)["response"] = poc.Response
	}

	if poc.ImageID != bson.NilObjectID {
		update["$set"].(bson.M)["image_id"] = poc.ImageID
	}

	if poc.ImageCaption != "" {
		update["$set"].(bson.M)["caption"] = poc.ImageCaption
	}

	if poc.TextLanguage != "" {
		update["$set"].(bson.M)["language"] = poc.TextLanguage
	}

	if poc.TextData != "" {
		update["$set"].(bson.M)["text"] = poc.TextData
	}

	update["$set"].(bson.M)["updated_at"] = time.Now()

	_, err := pi.collection.UpdateOne(context.Background(), filter, update)
	return err
}

func (pi *PocIndex) Delete(ID bson.ObjectID) error {
	_, err := pi.collection.DeleteOne(context.Background(), bson.M{"_id": ID})
	return err
}

func (pi *PocIndex) GetByID(pocID bson.ObjectID) (*Poc, error) {
	var poc Poc
	err := pi.collection.FindOne(context.Background(), bson.M{"_id": pocID}).Decode(&poc)
	if err != nil {
		return nil, err
	}

	if poc.ImageID != bson.NilObjectID {
		image, err := pi.driver.File().GetByID(poc.ImageID)
		if err != nil {
			return nil, err
		}
		poc.ImageData = base64.StdEncoding.EncodeToString(image)
	}

	return &poc, nil
}

func (pi *PocIndex) GetByVulnerabilityID(vulnerabilityID bson.ObjectID) ([]Poc, error) {
	cursor, err := pi.collection.Find(context.Background(), bson.M{"vulnerability_id": vulnerabilityID})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(context.Background())

	var pocs []Poc
	for cursor.Next(context.Background()) {
		var poc Poc
		if err := cursor.Decode(&poc); err != nil {
			return nil, err
		}

		if poc.ImageID != bson.NilObjectID {
			image, err := pi.driver.File().GetByID(poc.ImageID)
			if err != nil {
				return nil, err
			}
			poc.ImageData = base64.StdEncoding.EncodeToString(image)
		}

		pocs = append(pocs, poc)
	}

	return pocs, nil
}

func (pi *PocIndex) GetByVulnerabilityAndID(vulnerabilityID, pocID bson.ObjectID) (*Poc, error) {
	var poc Poc
	err := pi.collection.FindOne(context.Background(), bson.M{"_id": pocID, "vulnerability_id": vulnerabilityID}).Decode(&poc)
	if err != nil {
		return nil, err
	}

	if poc.ImageID != bson.NilObjectID {
		image, err := pi.driver.File().GetByID(poc.ImageID)
		if err != nil {
			return nil, err
		}
		poc.ImageData = base64.StdEncoding.EncodeToString(image)
	}

	return &poc, nil
}
