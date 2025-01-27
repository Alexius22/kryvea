package mongo

import (
	"context"
	"regexp"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

const (
	categoryCollection = "category"
)

type Category struct {
	Model              `bson:",inline"`
	Index              string `json:"index" bson:"index"`
	Name               string `json:"name" bson:"name"`
	GenericDescription string `json:"generic_description" bson:"generic_description"`
	GenericRemediation string `json:"generic_remediation" bson:"generic_remediation"`
}

type CategoryIndex struct {
	driver     *Driver
	collection *mongo.Collection
}

func (d *Driver) Category() *CategoryIndex {
	return &CategoryIndex{
		driver:     d,
		collection: d.database.Collection(categoryCollection),
	}
}

func (ci CategoryIndex) init() error {
	_, err := ci.collection.Indexes().CreateOne(
		context.Background(),
		mongo.IndexModel{
			Keys: bson.D{
				{Key: "index", Value: 1},
				{Key: "name", Value: 1},
			},
			Options: options.Index().SetUnique(true),
		},
	)
	return err
}

func (ci *CategoryIndex) Insert(category *Category) error {
	category.Model = Model{
		ID:        primitive.NewObjectID(),
		UpdatedAt: time.Now(),
		CreatedAt: time.Now(),
	}
	_, err := ci.collection.InsertOne(context.Background(), category)
	return err
}

func (ci *CategoryIndex) Update(ID primitive.ObjectID, category *Category) error {
	filter := bson.M{"_id": ID}

	update := bson.M{
		"$set": bson.M{
			"updated_at":          time.Now(),
			"index":               category.Index,
			"name":                category.Name,
			"generic_description": category.GenericDescription,
			"generic_remediation": category.GenericRemediation,
		},
	}

	_, err := ci.collection.UpdateOne(context.Background(), filter, update)
	return err
}

func (ci *CategoryIndex) Delete(ID primitive.ObjectID) error {
	_, err := ci.collection.DeleteOne(context.Background(), bson.M{"_id": ID})
	if err != nil {
		return err
	}

	filter := bson.M{"category_id": ID}
	update := bson.M{
		"$set": bson.M{
			"category_id": primitive.NilObjectID,
		},
	}

	_, err = ci.driver.Vulnerability().collection.UpdateMany(context.Background(), filter, update)
	return err
}

func (ci *CategoryIndex) GetAll() ([]Category, error) {
	var categories []Category
	cursor, err := ci.collection.Find(context.Background(), bson.M{})
	if err != nil {
		return categories, err
	}
	defer cursor.Close(context.Background())

	err = cursor.All(context.Background(), &categories)
	return categories, err
}

func (ci *CategoryIndex) GetByID(categoryID primitive.ObjectID) (*Category, error) {
	var category Category
	err := ci.collection.FindOne(context.Background(), bson.M{"_id": categoryID}).Decode(&category)
	if err != nil {
		return nil, err
	}

	return &category, nil
}

func (ci *CategoryIndex) Search(query string) ([]Category, error) {
	cursor, err := ci.collection.Find(context.Background(), bson.M{"$or": []bson.M{
		{"index": bson.M{"$regex": primitive.Regex{Pattern: regexp.QuoteMeta(query), Options: "i"}}},
		{"name": bson.M{"$regex": primitive.Regex{Pattern: regexp.QuoteMeta(query), Options: "i"}}},
	}})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(context.Background())

	var categories []Category
	err = cursor.All(context.Background(), &categories)
	if err != nil {
		return nil, err
	}

	return categories, err
}
