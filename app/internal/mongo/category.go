package mongo

import (
	"context"
	"regexp"
	"time"

	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

const (
	categoryCollection = "category"

	SourceGeneric = "generic"
	SourceNessus  = "nessus"
	SourceBurp    = "burp"
)

type Category struct {
	Model              `bson:",inline"`
	Index              string            `json:"index" bson:"index"`
	Name               string            `json:"name" bson:"name"`
	GenericDescription map[string]string `json:"generic_description" bson:"generic_description"`
	GenericRemediation map[string]string `json:"generic_remediation" bson:"generic_remediation"`
	References         []string          `json:"references" bson:"references"`
	Source             string            `json:"source" bson:"source"`
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

func (ci *CategoryIndex) Insert(category *Category) (uuid.UUID, error) {
	id, err := uuid.NewRandom()
	if err != nil {
		return uuid.Nil, err
	}

	category.Model = Model{
		ID:        id,
		UpdatedAt: time.Now(),
		CreatedAt: time.Now(),
	}

	_, err = ci.collection.InsertOne(context.Background(), category)
	if err != nil {
		return uuid.Nil, enrichError(err)
	}

	return category.ID, err
}

func (ci *CategoryIndex) Upsert(category *Category, override bool) (uuid.UUID, error) {
	if !override {
		return ci.Insert(category)
	}

	id, isNew, err := ci.FirstOrInsert(category)
	if err == nil && isNew {
		return id, nil
	}

	if err != nil {
		return uuid.Nil, err
	}

	err = ci.Update(id, category)
	if err != nil {
		return uuid.Nil, err
	}

	return id, nil
}

func (ci *CategoryIndex) FirstOrInsert(category *Category) (uuid.UUID, bool, error) {
	var existingCategory Assessment
	err := ci.collection.FindOne(context.Background(), bson.M{"index": category.Index, "name": category.Name}).Decode(&existingCategory)
	if err == nil {
		return existingCategory.ID, false, nil
	}
	if err != mongo.ErrNoDocuments {
		return uuid.Nil, false, err
	}

	id, err := ci.Insert(category)
	return id, true, err
}

func (ci *CategoryIndex) Update(ID uuid.UUID, category *Category) error {
	filter := bson.M{"_id": ID}

	update := bson.M{
		"$set": bson.M{
			"updated_at":          time.Now(),
			"index":               category.Index,
			"name":                category.Name,
			"generic_description": category.GenericDescription,
			"generic_remediation": category.GenericRemediation,
			"references":          category.References,
			"source":              category.Source,
		},
	}

	_, err := ci.collection.UpdateOne(context.Background(), filter, update)
	return enrichError(err)
}

func (ci *CategoryIndex) Delete(ID uuid.UUID) error {
	_, err := ci.collection.DeleteOne(context.Background(), bson.M{"_id": ID})
	if err != nil {
		return err
	}

	filter := bson.M{"category_id": ID}
	update := bson.M{
		"$set": bson.M{
			"category_id": uuid.Nil,
		},
	}

	_, err = ci.driver.Vulnerability().collection.UpdateMany(context.Background(), filter, update)
	return err
}

func (ci *CategoryIndex) GetAll() ([]Category, error) {
	categories := []Category{}
	cursor, err := ci.collection.Find(context.Background(), bson.M{})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(context.Background())

	err = cursor.All(context.Background(), &categories)
	return categories, err
}

func (ci *CategoryIndex) GetByID(categoryID uuid.UUID) (*Category, error) {
	var category Category
	err := ci.collection.FindOne(context.Background(), bson.M{"_id": categoryID}).Decode(&category)
	if err != nil {
		return nil, err
	}

	return &category, nil
}

func (ci *CategoryIndex) Search(query string) ([]Category, error) {
	cursor, err := ci.collection.Find(context.Background(), bson.M{"$or": []bson.M{
		{"index": bson.M{"$regex": bson.Regex{Pattern: regexp.QuoteMeta(query), Options: "i"}}},
		{"name": bson.M{"$regex": bson.Regex{Pattern: regexp.QuoteMeta(query), Options: "i"}}},
	}})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(context.Background())

	categories := []Category{}
	err = cursor.All(context.Background(), &categories)
	if err != nil {
		return nil, err
	}

	return categories, err
}
