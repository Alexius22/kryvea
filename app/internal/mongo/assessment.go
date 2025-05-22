package mongo

import (
	"context"
	"regexp"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

const (
	assessmentCollection = "assessment"
)

var AssessmentPipeline = mongo.Pipeline{
	bson.D{{Key: "$lookup", Value: bson.D{
		{Key: "from", Value: "target"},
		{Key: "localField", Value: "targets._id"},
		{Key: "foreignField", Value: "_id"},
		{Key: "as", Value: "targetData"},
	}}},
	bson.D{
		{Key: "$lookup", Value: bson.D{
			{Key: "from", Value: "vulnerability"},
			{Key: "localField", Value: "_id"},
			{Key: "foreignField", Value: "assessment._id"},
			{Key: "as", Value: "vulnerabilityData"},
		}}},
	bson.D{
		{Key: "$set", Value: bson.D{
			{Key: "vulnerability_count", Value: bson.D{
				{Key: "$size", Value: "$vulnerabilityData"},
			}},
		}}},
	bson.D{{Key: "$unset", Value: "vulnerabilityData"}},

	bson.D{
		{Key: "$lookup", Value: bson.D{
			{Key: "from", Value: "customer"},
			{Key: "localField", Value: "customer._id"},
			{Key: "foreignField", Value: "_id"},
			{Key: "as", Value: "customerData"},
		}}},
	bson.D{
		{Key: "$set", Value: bson.D{
			{Key: "customer.name", Value: bson.D{
				{Key: "$arrayElemAt", Value: bson.A{"$customerData.name", 0}},
			}},
		}}},
	bson.D{{Key: "$unset", Value: "customerData"}},
}

type Assessment struct {
	Model              `bson:",inline"`
	Name               string             `json:"name" bson:"name"`
	StartDateTime      time.Time          `json:"start_date_time" bson:"start_date_time"`
	EndDateTime        time.Time          `json:"end_date_time" bson:"end_date_time"`
	Targets            []AssessmentTarget `json:"targets" bson:"targets"`
	Status             string             `json:"status" bson:"status"`
	AssessmentType     string             `json:"assessment_type" bson:"assessment_type"`
	CVSSVersion        string             `json:"cvss_version" bson:"cvss_version"`
	Environment        string             `json:"environment" bson:"environment"`
	TestingType        string             `json:"testing_type" bson:"testing_type"`
	OSSTMMVector       string             `json:"osstmm_vector" bson:"osstmm_vector"`
	VulnerabilityCount int                `json:"vulnerability_count" bson:"vulnerability_count"`
	Customer           AssessmentCustomer `json:"customer" bson:"customer"`
}

type AssessmentTarget struct {
	ID       bson.ObjectID `json:"id" bson:"_id"`
	IP       string        `json:"ip" bson:"ip"`
	Hostname string        `json:"hostname" bson:"hostname"`
}

type AssessmentCustomer struct {
	ID   bson.ObjectID `json:"id" bson:"_id"`
	Name string        `json:"name" bson:"name"`
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
			Keys: bson.D{
				{Key: "name", Value: 1},
			},
			Options: options.Index().SetUnique(true),
		},
	)
	return err
}

func (ai *AssessmentIndex) Insert(assessment *Assessment) (bson.ObjectID, error) {
	err := ai.driver.Customer().collection.FindOne(context.Background(), bson.M{"_id": assessment.Customer.ID}).Err()
	if err != nil {
		return bson.NilObjectID, err
	}

	assessment.Model = Model{
		ID:        bson.NewObjectID(),
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	if assessment.Targets == nil {
		assessment.Targets = []AssessmentTarget{}
	}

	_, err = ai.collection.InsertOne(context.Background(), assessment)
	return assessment.ID, err
}

func (ai *AssessmentIndex) GetByID(assessmentID bson.ObjectID) (*Assessment, error) {
	var assessment Assessment
	err := ai.collection.FindOne(context.Background(), bson.M{"_id": assessmentID}).Decode(&assessment)
	if err != nil {
		return nil, err
	}

	return &assessment, nil
}

func (ai *AssessmentIndex) GetByCustomerID(customerID bson.ObjectID) ([]Assessment, error) {
	pipeline := append(AssessmentPipeline, bson.D{{Key: "$match", Value: bson.M{"customer._id": customerID}}})
	cursor, err := ai.collection.Aggregate(context.Background(), pipeline)
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

func (ai *AssessmentIndex) GetByCustomerAndID(customerID, assessmentID bson.ObjectID) (*Assessment, error) {
	var assessment Assessment
	err := ai.collection.FindOne(context.Background(), bson.M{"_id": assessmentID, "customer._id": customerID}).Decode(&assessment)
	if err != nil {
		return nil, err
	}

	return &assessment, nil
}

func (ai *AssessmentIndex) Search(customers []bson.ObjectID, name string) ([]Assessment, error) {
	filter := bson.M{"name": bson.M{"$regex": bson.Regex{Pattern: regexp.QuoteMeta(name), Options: "i"}}}

	if customers != nil {
		filter["customer._id"] = bson.M{"$in": customers}
	}

	cursor, err := ai.collection.Find(context.Background(), filter)
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
	pipeline := append(AssessmentPipeline, bson.D{{Key: "$sort", Value: bson.M{"name": 1}}})
	cursor, err := ai.collection.Aggregate(context.Background(), pipeline)
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

func (ai *AssessmentIndex) Update(assessmentID bson.ObjectID, assessment *Assessment) error {
	filter := bson.M{"_id": assessmentID}

	update := bson.M{
		"$set": bson.M{
			"updated_at":      time.Now(),
			"name":            assessment.Name,
			"start_date_time": assessment.StartDateTime,
			"end_date_time":   assessment.EndDateTime,
			"targets":         assessment.Targets,
			"status":          assessment.Status,
			"type":            assessment.AssessmentType,
			"cvss_version":    assessment.CVSSVersion,
			"environment":     assessment.Environment,
			"method":          assessment.TestingType,
			"osstmm_vector":   assessment.OSSTMMVector,
		},
	}

	_, err := ai.collection.UpdateOne(context.Background(), filter, update)
	return err
}

func (ai *AssessmentIndex) Delete(assessmentID bson.ObjectID) error {
	_, err := ai.collection.DeleteOne(context.Background(), bson.M{"_id": assessmentID})
	if err != nil {
		return err
	}

	// Delete all vulnerabilities and PoCs associated with the assessment
	vulnerabilities, err := ai.driver.Vulnerability().GetByAssessmentID(assessmentID)
	if err != nil {
		return err
	}

	for _, vulnerability := range vulnerabilities {
		if err := ai.driver.Vulnerability().Delete(vulnerability.ID); err != nil {
			return err
		}
	}

	// Remove the assessment from the user's list
	filter := bson.M{"owned_assessments": assessmentID}
	update := bson.M{"$pull": bson.M{"owned_assessments": assessmentID}}
	_, err = ai.driver.User().collection.UpdateMany(context.Background(), filter, update)
	return err
}

func (ai *AssessmentIndex) Clone(assessmentID bson.ObjectID, assessmentName string) (bson.ObjectID, error) {
	assessment, err := ai.GetByID(assessmentID)
	if err != nil {
		return bson.NilObjectID, err
	}

	assessment.ID = bson.NewObjectID()
	assessment.Name = assessmentName
	assessment.CreatedAt = time.Now()
	assessment.UpdatedAt = time.Now()

	_, err = ai.collection.InsertOne(context.Background(), assessment)
	if err != nil {
		return bson.NilObjectID, err
	}

	// Clone vulnerabilities
	vulnerabilities, err := ai.driver.Vulnerability().GetByAssessmentID(assessmentID)
	if err != nil {
		return bson.NilObjectID, err
	}

	for _, vulnerability := range vulnerabilities {
		_, err := ai.driver.Vulnerability().Clone(vulnerability.ID, assessment.ID)
		if err != nil {
			return bson.NilObjectID, err
		}
	}

	return assessment.ID, nil
}
