package mongo

import (
	"context"
	"fmt"
	"regexp"
	"time"

	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

const (
	assessmentCollection = "assessment"
)

type Assessment struct {
	Model              `bson:",inline"`
	Name               string          `json:"name,omitempty" bson:"name"`
	Language           string          `json:"language,omitempty" bson:"language"`
	StartDateTime      time.Time       `json:"start_date_time,omitempty" bson:"start_date_time"`
	EndDateTime        time.Time       `json:"end_date_time,omitempty" bson:"end_date_time"`
	KickoffDateTime    time.Time       `json:"kickoff_date_time,omitempty" bson:"kickoff_date_time"`
	Targets            []Target        `json:"targets,omitempty" bson:"targets"`
	Status             string          `json:"status,omitempty" bson:"status"`
	Type               AssessmentType  `json:"type,omitempty" bson:"type"`
	CVSSVersions       map[string]bool `json:"cvss_versions,omitempty" bson:"cvss_versions"`
	Environment        string          `json:"environment,omitempty" bson:"environment"`
	TestingType        string          `json:"testing_type,omitempty" bson:"testing_type"`
	OSSTMMVector       string          `json:"osstmm_vector,omitempty" bson:"osstmm_vector"`
	VulnerabilityCount int             `json:"vulnerability_count,omitempty" bson:"vulnerability_count"`
	Customer           Customer        `json:"customer,omitempty" bson:"customer"`
	IsOwned            bool            `json:"is_owned,omitempty" bson:"is_owned"`
}

type AssessmentType struct {
	Short string `json:"short" bson:"short"`
	Full  string `json:"full" bson:"full"`
}

type AssessmentIndex struct {
	driver     *Driver
	collection *mongo.Collection
}

const (
	ASSESSMENT_STATUS_ON_HOLD     = "On Hold"
	ASSESSMENT_STATUS_IN_PROGRESS = "In Progress"
	ASSESSMENT_STATUS_COMPLETED   = "Completed"
)

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
				{Key: "language", Value: 1},
				{Key: "customer._id", Value: 1},
			},
			Options: options.Index().SetUnique(true),
		},
	)
	return err
}

func (ai *AssessmentIndex) Insert(assessment *Assessment, customerID uuid.UUID) (uuid.UUID, error) {
	err := ai.driver.Customer().collection.FindOne(context.Background(), bson.M{"_id": customerID}).Err()
	if err != nil {
		return uuid.Nil, err
	}

	id, err := uuid.NewRandom()
	if err != nil {
		return uuid.Nil, err
	}

	assessment.Model = Model{
		ID:        id,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	assessment.IsOwned = false
	assessment.Customer = Customer{
		Model: Model{
			ID: customerID,
		},
	}

	_, err = ai.collection.InsertOne(context.Background(), assessment)
	if err != nil {
		return uuid.Nil, err
	}

	return assessment.ID, nil
}

func (ai *AssessmentIndex) GetByID(assessmentID uuid.UUID) (*Assessment, error) {
	var assessment Assessment
	err := ai.collection.FindOne(context.Background(), bson.M{"_id": assessmentID}).Decode(&assessment)
	if err != nil {
		return nil, err
	}

	return &assessment, nil
}

func (ai *AssessmentIndex) GetByIDForHydrate(assessmentID uuid.UUID) (*Assessment, error) {
	filter := bson.M{"_id": assessmentID}
	opts := options.FindOne().SetProjection(bson.M{
		"name": 1,
	})

	var assessment Assessment
	err := ai.collection.FindOne(context.Background(), filter, opts).Decode(&assessment)
	if err != nil {
		return nil, err
	}

	return &assessment, nil
}

func (ai *AssessmentIndex) GetManyForHydrate(assessments []Assessment) ([]Assessment, error) {
	assessmentIDs := make([]uuid.UUID, len(assessments))
	for i := range assessments {
		assessmentIDs[i] = assessments[i].ID
	}

	filter := bson.M{"_id": bson.M{"$in": assessmentIDs}}
	opts := options.Find().SetProjection(bson.M{
		"name": 1,
	})

	cursor, err := ai.collection.Find(context.Background(), filter, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(context.Background())

	assessmentsMongo := []Assessment{}
	err = cursor.All(context.Background(), &assessmentsMongo)
	if err != nil {
		return nil, err
	}

	return assessmentsMongo, nil
}

func (ai *AssessmentIndex) GetMultipleByID(assessmentIDs []uuid.UUID) ([]Assessment, error) {
	filter := bson.M{
		"_id": bson.M{"$in": assessmentIDs},
	}

	cursor, err := ai.collection.Find(context.Background(), filter)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(context.Background())

	assessment := []Assessment{}
	err = cursor.All(context.Background(), &assessment)
	if err != nil {
		return nil, err
	}

	for i := range assessment {
		err = ai.hydrate(&assessment[i])
		if err != nil {
			return nil, err
		}
	}

	return assessment, nil
}

func (ai *AssessmentIndex) GetByIDPipeline(assessmentID uuid.UUID) (*Assessment, error) {
	filter := bson.M{"_id": assessmentID}

	assessment := &Assessment{}
	err := ai.collection.FindOne(context.Background(), filter).Decode(assessment)
	if err != nil {
		return nil, err
	}

	err = ai.hydrate(assessment)
	if err != nil {
		return nil, err
	}

	return assessment, nil
}

func (ai *AssessmentIndex) GetByCustomerID(customerID uuid.UUID) ([]Assessment, error) {
	filter := bson.M{"customer._id": customerID}

	cursor, err := ai.collection.Find(context.Background(), filter)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(context.Background())

	assessments := []Assessment{}
	err = cursor.All(context.Background(), &assessments)
	if err != nil {
		return nil, err
	}

	for i := range assessments {
		err = ai.hydrate(&assessments[i])
		if err != nil {
			return nil, err
		}
	}

	return assessments, nil
}

func (ai *AssessmentIndex) GetByCustomerAndID(customerID, assessmentID uuid.UUID) (*Assessment, error) {
	var assessment Assessment
	err := ai.collection.FindOne(context.Background(), bson.M{"_id": assessmentID, "customer._id": customerID}).Decode(&assessment)
	if err != nil {
		return nil, err
	}

	return &assessment, nil
}

func (ai *AssessmentIndex) Search(customers []uuid.UUID, customerID uuid.UUID, name string) ([]Assessment, error) {
	filter := bson.M{
		"name": bson.M{"$regex": bson.Regex{Pattern: regexp.QuoteMeta(name), Options: "i"}},
	}

	if customerID != uuid.Nil {
		filter["customer._id"] = customerID
	}

	if customerID == uuid.Nil && customers != nil {
		filter["customer._id"] = bson.M{"$in": customers}
	}

	cursor, err := ai.collection.Find(context.Background(), filter)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(context.Background())

	assessment := []Assessment{}
	err = cursor.All(context.Background(), &assessment)
	if err != nil {
		return nil, err
	}

	for i := range assessment {
		err = ai.hydrate(&assessment[i])
		if err != nil {
			return nil, err
		}
	}

	return assessment, nil
}

func (ai *AssessmentIndex) Update(assessmentID uuid.UUID, assessment *Assessment) error {
	filter := bson.M{"_id": assessmentID}

	update := bson.M{
		"$set": bson.M{
			"updated_at":        time.Now(),
			"name":              assessment.Name,
			"language":          assessment.Language,
			"start_date_time":   assessment.StartDateTime,
			"end_date_time":     assessment.EndDateTime,
			"kickoff_date_time": assessment.KickoffDateTime,
			"targets":           assessment.Targets,
			"status":            assessment.Status,
			"type":              assessment.Type,
			"cvss_versions":     assessment.CVSSVersions,
			"environment":       assessment.Environment,
			"testing_type":      assessment.TestingType,
			"osstmm_vector":     assessment.OSSTMMVector,
		},
	}

	_, err := ai.collection.UpdateOne(context.Background(), filter, update)
	return err
}

func (ai *AssessmentIndex) UpdateStatus(assessmentID uuid.UUID, assessment *Assessment) error {
	filter := bson.M{"_id": assessmentID}

	update := bson.M{
		"$set": bson.M{
			"updated_at": time.Now(),
			"status":     assessment.Status,
		},
	}

	_, err := ai.collection.UpdateOne(context.Background(), filter, update)
	return err
}

func (ai *AssessmentIndex) UpdateTargets(assessmentID uuid.UUID, target uuid.UUID) error {
	filter := bson.M{"_id": assessmentID}

	update := bson.M{
		"$set": bson.M{
			"updated_at": time.Now(),
		},
		"$addToSet": bson.M{
			"targets": bson.M{
				"_id": target,
			},
		},
	}

	_, err := ai.collection.UpdateOne(context.Background(), filter, update)
	return err
}

func (ai *AssessmentIndex) Delete(assessmentID uuid.UUID) error {
	// TODO: move inside user index
	// Remove the assessment from the user's list
	filter := bson.M{"assessments._id": assessmentID}
	update := bson.M{"$pull": bson.M{"assessments": bson.M{"_id": assessmentID}}}
	_, err := ai.driver.User().collection.UpdateMany(context.Background(), filter, update)
	if err != nil {
		return fmt.Errorf("failed to remove Assessment %s from Users: %w", assessmentID.String(), err)
	}

	// Delete all vulnerabilities associated with the assessment
	if err := ai.driver.Vulnerability().DeleteManyByAssessmentID(assessmentID); err != nil {
		return fmt.Errorf("failed to delete Vulnerabilities for Assessment %s: %w", assessmentID.String(), err)
	}

	// Delete the assessment
	_, err = ai.collection.DeleteOne(context.Background(), bson.M{"_id": assessmentID})
	return err
}

func (ai *AssessmentIndex) Clone(assessmentID uuid.UUID, assessmentName string, includePocs bool) (uuid.UUID, error) {
	assessment, err := ai.GetByID(assessmentID)
	if err != nil {
		return uuid.Nil, err
	}

	id, err := uuid.NewRandom()
	if err != nil {
		return uuid.Nil, err
	}

	assessment.ID = id
	assessment.Name = assessmentName
	assessment.CreatedAt = time.Now()
	assessment.UpdatedAt = assessment.CreatedAt

	_, err = ai.collection.InsertOne(context.Background(), assessment)
	if err != nil {
		return uuid.Nil, err
	}

	// Clone vulnerabilities
	vulnerabilities, err := ai.driver.Vulnerability().GetByAssessmentID(assessmentID)
	if err != nil {
		return uuid.Nil, err
	}

	for _, vulnerability := range vulnerabilities {
		_, err := ai.driver.Vulnerability().Clone(vulnerability.ID, assessment.ID, includePocs)
		if err != nil {
			return uuid.Nil, err
		}
	}

	return assessment.ID, nil
}

// hydrate fills in the nested fields for an Assessment
func (ai *AssessmentIndex) hydrate(assessment *Assessment) error {
	customer, err := ai.driver.Customer().GetByIDForHydrate(assessment.Customer.ID)
	if err != nil {
		return err
	}

	assessment.Customer = *customer

	for i := range assessment.Targets {
		target, err := ai.driver.Target().GetByID(assessment.Targets[i].ID)
		if err != nil {
			return err
		}

		assessment.Targets[i] = *target
	}

	filter := bson.M{"assessment._id": assessment.ID}
	vulnCount, err := ai.driver.Vulnerability().collection.CountDocuments(context.Background(), filter)
	if err != nil {
		return err
	}

	assessment.VulnerabilityCount = int(vulnCount)

	return nil
}
