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

var AssessmentPipeline = mongo.Pipeline{
	bson.D{{Key: "$lookup", Value: bson.D{
		{Key: "from", Value: "target"},
		{Key: "localField", Value: "targets._id"},
		{Key: "foreignField", Value: "_id"},
		{Key: "as", Value: "targetData"},
	}}},
	bson.D{{Key: "$set", Value: bson.D{
		{Key: "targets", Value: bson.D{
			{Key: "$map", Value: bson.D{
				{Key: "input", Value: "$targets"},
				{Key: "as", Value: "target"},
				{Key: "in", Value: bson.D{
					// TODO: there must be a way to improve this
					{Key: "_id", Value: "$$target._id"},
					{Key: "ip", Value: bson.D{
						{Key: "$let", Value: bson.D{
							{Key: "vars", Value: bson.D{
								{Key: "matched", Value: bson.D{
									{Key: "$arrayElemAt", Value: bson.A{
										bson.D{{Key: "$filter", Value: bson.D{
											{Key: "input", Value: "$targetData"},
											{Key: "as", Value: "tar"},
											{Key: "cond", Value: bson.D{
												{Key: "$eq", Value: bson.A{"$$tar._id", "$$target._id"}},
											}},
										}}},
										0,
									}},
								}},
							}},
							{Key: "in", Value: "$$matched.ip"},
						}},
					}},
					{Key: "hostname", Value: bson.D{
						{Key: "$let", Value: bson.D{
							{Key: "vars", Value: bson.D{
								{Key: "matched", Value: bson.D{
									{Key: "$arrayElemAt", Value: bson.A{
										bson.D{{Key: "$filter", Value: bson.D{
											{Key: "input", Value: "$targetData"},
											{Key: "as", Value: "tar"},
											{Key: "cond", Value: bson.D{
												{Key: "$eq", Value: bson.A{"$$tar._id", "$$target._id"}},
											}},
										}}},
										0,
									}},
								}},
							}},
							{Key: "in", Value: "$$matched.hostname"},
						}},
					}},
				}},
			}},
		}},
	}}},
	bson.D{{Key: "$unset", Value: "targetData"}},

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
	ID       primitive.ObjectID `json:"id" bson:"_id"`
	IP       string             `json:"ip" bson:"ip"`
	Hostname string             `json:"hostname" bson:"hostname"`
}

type AssessmentCustomer struct {
	ID   primitive.ObjectID `json:"id" bson:"_id"`
	Name string             `json:"name" bson:"name"`
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

func (ai *AssessmentIndex) Insert(assessment *Assessment) (primitive.ObjectID, error) {
	err := ai.driver.Customer().collection.FindOne(context.Background(), bson.M{"_id": assessment.Customer.ID}).Err()
	if err != nil {
		return primitive.NilObjectID, err
	}

	assessment.Model = Model{
		ID:        primitive.NewObjectID(),
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}
	_, err = ai.collection.InsertOne(context.Background(), assessment)
	return assessment.ID, err
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

func (ai *AssessmentIndex) Search(customers []primitive.ObjectID, name string) ([]Assessment, error) {
	filter := bson.M{"name": bson.M{"$regex": primitive.Regex{Pattern: regexp.QuoteMeta(name), Options: "i"}}}

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

func (ai *AssessmentIndex) Update(assessmentID primitive.ObjectID, assessment *Assessment) error {
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

func (ai *AssessmentIndex) Delete(assessmentID primitive.ObjectID) error {
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
