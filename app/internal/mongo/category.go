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

var (
	ImmutableCategoryID uuid.UUID = [16]byte{
		'K', 'R', 'Y', 'V',
		'E', 'A', '-', 'I',
		'M', 'M', 'U', 'T',
		'A', 'B', 'L', 'E',
	}
)

type Category struct {
	Model              `bson:",inline"`
	Identifier         string            `json:"identifier" bson:"identifier"`
	Name               string            `json:"name" bson:"name"`
	GenericDescription map[string]string `json:"generic_description,omitempty" bson:"generic_description"`
	GenericRemediation map[string]string `json:"generic_remediation,omitempty" bson:"generic_remediation"`
	LanguagesOrder     []string          `json:"languages_order,omitempty" bson:"languages_order"`
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
				{Key: "identifier", Value: 1},
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
		return uuid.Nil, err
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
	err := ci.collection.FindOne(context.Background(), bson.M{"identifier": category.Identifier, "name": category.Name}).Decode(&existingCategory)
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
	if ID == ImmutableCategoryID {
		return ErrImmutableCategory
	}

	filter := bson.M{"_id": ID}

	update := bson.M{
		"$set": bson.M{
			"updated_at":          time.Now(),
			"identifier":          category.Identifier,
			"name":                category.Name,
			"generic_description": category.GenericDescription,
			"generic_remediation": category.GenericRemediation,
			"references":          category.References,
			"source":              category.Source,
		},
	}

	_, err := ci.collection.UpdateOne(context.Background(), filter, update)
	return err
}

func (ci *CategoryIndex) Delete(ID uuid.UUID) error {
	if ID == ImmutableCategoryID {
		return ErrImmutableCategory
	}

	_, err := ci.collection.DeleteOne(context.Background(), bson.M{"_id": ID})
	if err != nil {
		return err
	}

	filter := bson.M{"category._id": ID}
	update := bson.M{
		"$set": bson.M{
			"category._id": ImmutableCategoryID,
		},
	}

	_, err = ci.driver.Vulnerability().collection.UpdateMany(context.Background(), filter, update)
	return err
}

func (ci *CategoryIndex) GetAll() ([]Category, error) {
	filter := bson.M{"_id": bson.M{"$ne": ImmutableCategoryID}}

	categories := []Category{}
	cursor, err := ci.collection.Find(context.Background(), filter)
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
	filter := bson.M{}
	if query != "" {
		filter = bson.M{
			"$or": []bson.M{
				{"identifier": bson.M{"$regex": bson.Regex{Pattern: regexp.QuoteMeta(query), Options: "i"}}},
				{"name": bson.M{"$regex": bson.Regex{Pattern: regexp.QuoteMeta(query), Options: "i"}}},
			},
		}
	}

	cursor, err := ci.collection.Find(context.Background(), filter)
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
