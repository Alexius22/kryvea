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
	assessmentCollection = "assessment"
)

type Assessment struct {
	Model
	Name          string               `json:"name" bson:"name"`
	Notes         string               `json:"notes" bson:"notes"`
	StartDateTime time.Time            `json:"start_date_time" bson:"start_date_time"`
	EndDateTime   time.Time            `json:"end_date_time" bson:"end_date_time"`
	Targets       []primitive.ObjectID `json:"targets" bson:"targets"`
	Status        string               `json:"status" bson:"status"`
	Type          string               `json:"type" bson:"type"`
	CVSSVersion   int                  `json:"cvss_version" bson:"cvss_version"`
	Environment   string               `json:"environment" bson:"environment"`
	Network       string               `json:"network" bson:"network"`
	Method        string               `json:"method" bson:"method"`
	OSSTMMVector  string               `json:"osstmm_vector" bson:"osstmm_vector"`
	CustomerID    primitive.ObjectID   `json:"customer_id" bson:"customer_id"`
}

type AssessmentIndex struct {
	driver     *Driver
	collection *mongo.Collection
}

func (d *Driver) Assessment() *AssessmentIndex {
	return &AssessmentIndex{
		driver:     d,
		collection: d.database.Collection(assessmentCollection),
	}
}

func (ai AssessmentIndex) init() error {
	_, err := ai.collection.Indexes().CreateOne(
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

func (ai *AssessmentIndex) Insert(assessment *Assessment) error {
	err := ai.driver.Customer().collection.FindOne(context.Background(), bson.M{"_id": assessment.CustomerID}).Err()
	if err != nil {
		return err
	}

	assessment.Model = Model{
		ID:        primitive.NewObjectID(),
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}
	_, err = ai.collection.InsertOne(context.Background(), assessment)
	return err
}

func (ai *AssessmentIndex) GetByID(assessmentID primitive.ObjectID) (*Assessment, error) {
	var assessment Assessment
	err := ai.collection.FindOne(context.Background(), bson.M{"_id": assessmentID}).Decode(&assessment)
	if err != nil {
		return nil, err
	}

	return &assessment, nil
}

func (ai *AssessmentIndex) GetByCustomerID(customerID primitive.ObjectID) ([]Assessment, error) {
	cursor, err := ai.collection.Find(context.Background(), bson.M{"customer_id": customerID})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(context.Background())

	var assessments []Assessment
	if err := cursor.All(context.Background(), &assessments); err != nil {
		return nil, err
	}

	return assessments, nil
}

func (ai *AssessmentIndex) Search(name string) ([]Assessment, error) {
	cursor, err := ai.collection.Find(context.Background(), bson.M{"name": bson.M{"$regex": primitive.Regex{Pattern: regexp.QuoteMeta(name), Options: "i"}}})
	if err != nil {
		return nil, err
	}

	var assessments []Assessment
	if err := cursor.All(context.Background(), &assessments); err != nil {
		return nil, err
	}

	return assessments, nil
}

func (ai *AssessmentIndex) GetAll() ([]Assessment, error) {
	cursor, err := ai.collection.Find(context.Background(), bson.M{})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(context.Background())

	var assessments []Assessment
	if err := cursor.All(context.Background(), &assessments); err != nil {
		return nil, err
	}

	return assessments, nil
}
