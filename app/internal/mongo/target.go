package mongo

import (
	"context"
	"errors"
	"regexp"
	"time"

	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

const (
	targetCollection = "target"
)

type Target struct {
	Model    `bson:",inline"`
	IPv4     string   `json:"ipv4,omitempty" bson:"ipv4"`
	IPv6     string   `json:"ipv6,omitempty" bson:"ipv6"`
	Port     int      `json:"port,omitempty" bson:"port"`
	Protocol string   `json:"protocol,omitempty" bson:"protocol"`
	FQDN     string   `json:"fqdn" bson:"fqdn"`
	Tag      string   `json:"tag,omitempty" bson:"tag"`
	Customer Customer `json:"customer,omitempty" bson:"customer"`
}

type TargetIndex struct {
	driver     *Driver
	collection *mongo.Collection
}

func (d *Driver) Target() *TargetIndex {
	return &TargetIndex{
		driver:     d,
		collection: d.database.Collection(targetCollection),
	}
}

func (ti TargetIndex) init() error {
	_, err := ti.collection.Indexes().CreateOne(
		context.Background(),
		mongo.IndexModel{
			Keys: bson.D{
				{Key: "ipv4", Value: 1},
				{Key: "ipv6", Value: 1},
				{Key: "fqdn", Value: 1},
				{Key: "tag", Value: 1},
				{Key: "customer._id", Value: 1},
			},
			Options: options.Index().SetUnique(true),
		},
	)
	return err
}

func (ti *TargetIndex) Insert(target *Target, customerID uuid.UUID, assessmentID uuid.UUID) (uuid.UUID, error) {
	err := ti.driver.Customer().collection.FindOne(context.Background(), bson.M{"_id": customerID}).Err()
	if err != nil {
		return uuid.Nil, err
	}

	var assessment *Assessment
	if assessmentID != uuid.Nil {
		assessment, err = ti.driver.Assessment().GetByID(assessmentID)
		if err != nil {
			ti.driver.logger.Error().Err(err).Msg("failed to get assessment by ID")
			return uuid.Nil, err
		}

		if assessment.Customer.ID != customerID {
			ti.driver.logger.Error().Err(err).Msg("target does not belong to customer")
			return uuid.Nil, errors.New("target does not belong to customer")
		}
	}

	id, err := uuid.NewRandom()
	if err != nil {
		return uuid.Nil, err
	}

	target.Model = Model{
		ID:        id,
		UpdatedAt: time.Now(),
		CreatedAt: time.Now(),
	}

	target.Customer = Customer{
		Model: Model{
			ID: customerID,
		},
	}

	_, err = ti.collection.InsertOne(context.Background(), target)
	if err != nil {
		return uuid.Nil, err
	}

	if assessment != nil {
		err = ti.driver.Assessment().UpdateTargets(assessment.ID, target.ID)
		if err != nil {
			return uuid.Nil, err
		}
	}

	return target.ID, nil
}

func (ti *TargetIndex) FirstOrInsert(target *Target, customerID uuid.UUID) (uuid.UUID, bool, error) {
	err := ti.driver.Customer().collection.FindOne(context.Background(), bson.M{"_id": customerID}).Err()
	if err != nil {
		return uuid.Nil, false, err
	}

	var existingTarget Assessment
	err = ti.collection.FindOne(context.Background(), bson.M{
		"ipv4":         target.IPv4,
		"ipv6":         target.IPv6,
		"fqdn":         target.FQDN,
		"tag":          target.Tag,
		"customer._id": customerID,
	}).Decode(&existingTarget)
	if err == nil {
		return existingTarget.ID, false, nil
	}
	if err != mongo.ErrNoDocuments {
		return uuid.Nil, false, err
	}

	id, err := ti.Insert(target, customerID, uuid.Nil)
	return id, true, err
}

func (ti *TargetIndex) Update(targetID uuid.UUID, target *Target) error {
	filter := bson.M{"_id": targetID}

	update := bson.M{
		"$set": bson.M{
			"updated_at": time.Now(),
			"ipv4":       target.IPv4,
			"ipv6":       target.IPv6,
			"port":       target.Port,
			"protocol":   target.Protocol,
			"fqdn":       target.FQDN,
			"tag":        target.Tag,
		},
	}

	_, err := ti.collection.UpdateOne(context.Background(), filter, update)
	return err
}

func (ti *TargetIndex) Delete(targetID uuid.UUID) error {
	filter := bson.M{"target._id": targetID}
	update := bson.M{
		"$set": bson.M{
			"target._id": uuid.Nil,
		},
	}
	_, err := ti.driver.Vulnerability().collection.UpdateMany(context.Background(), filter, update)
	if err != nil {
		return err
	}

	filter = bson.M{"targets._id": targetID}
	update = bson.M{
		"$pull": bson.M{
			"targets": bson.M{"_id": targetID},
		},
	}
	_, err = ti.driver.Assessment().collection.UpdateMany(context.Background(), filter, update)
	if err != nil {
		return err
	}

	_, err = ti.collection.DeleteOne(context.Background(), bson.M{"_id": targetID})
	return err
}

func (ti *TargetIndex) GetByID(targetID uuid.UUID) (*Target, error) {
	var target Target
	err := ti.collection.FindOne(context.Background(), bson.M{"_id": targetID}).Decode(&target)
	if err != nil {
		return nil, err
	}

	return &target, nil
}
func (ti *TargetIndex) GetByIDPipeline(targetID uuid.UUID) (*Target, error) {
	filter := bson.M{"_id": targetID}

	target := &Target{}
	err := ti.collection.FindOne(context.Background(), filter).Decode(target)
	if err != nil {
		return nil, err
	}

	err = ti.hydrate(target)
	if err != nil {
		return nil, err
	}

	return target, nil
}

func (ti *TargetIndex) GetByCustomerID(customerID uuid.UUID) ([]Target, error) {
	filter := bson.M{"customer._id": customerID}
	cursor, err := ti.collection.Find(context.Background(), filter)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(context.Background())

	targets := []Target{}
	err = cursor.All(context.Background(), &targets)
	if err != nil {
		return nil, err
	}

	for i := range targets {
		err = ti.hydrate(&targets[i])
		if err != nil {
			return nil, err
		}
	}

	return targets, nil
}

func (ti *TargetIndex) GetByCustomerAndID(customerID, targetID uuid.UUID) (*Target, error) {
	filter := bson.M{
		"customer._id": customerID,
		"_id":          targetID,
	}

	target := &Target{}
	err := ti.collection.FindOne(context.Background(), filter).Decode(target)
	if err != nil {
		return nil, err
	}

	err = ti.hydrate(target)
	if err != nil {
		return nil, err
	}

	return target, nil
}

func (ti *TargetIndex) Search(customerID uuid.UUID, query string) ([]Target, error) {
	conditions := []bson.M{}

	if customerID != uuid.Nil {
		conditions = append(conditions, bson.M{"customer._id": customerID})
	}

	orCondition := bson.M{}
	if query != "" {
		orCondition = bson.M{
			"$or": []bson.M{
				{"ipv4": bson.Regex{Pattern: regexp.QuoteMeta(query), Options: "i"}},
				{"ipv6": bson.Regex{Pattern: regexp.QuoteMeta(query), Options: "i"}},
				{"port": bson.Regex{Pattern: regexp.QuoteMeta(query), Options: "i"}},
				{"protocol": bson.Regex{Pattern: regexp.QuoteMeta(query), Options: "i"}},
				{"fqdn": bson.Regex{Pattern: regexp.QuoteMeta(query), Options: "i"}},
				{"tag": bson.Regex{Pattern: regexp.QuoteMeta(query), Options: "i"}},
			},
		}
	}
	conditions = append(conditions, orCondition)

	filter := bson.M{
		"$and": conditions,
	}

	cursor, err := ti.collection.Find(context.Background(), filter)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(context.Background())

	targets := []Target{}
	err = cursor.All(context.Background(), &targets)
	if err != nil {
		return nil, err
	}

	for i := range targets {
		err = ti.hydrate(&targets[i])
		if err != nil {
			return nil, err
		}
	}

	return targets, nil
}

func (ti *TargetIndex) SearchWithinCustomers(customerIDs []uuid.UUID, query string) ([]Target, error) {
	conditions := []bson.M{}

	if customerIDs != nil {
		conditions = append(conditions, bson.M{"customer._id": bson.M{"$in": customerIDs}})
	}

	orCondition := bson.M{}
	if query != "" {
		orCondition = bson.M{
			"$or": []bson.M{
				{"ipv4": bson.Regex{Pattern: regexp.QuoteMeta(query), Options: "i"}},
				{"ipv6": bson.Regex{Pattern: regexp.QuoteMeta(query), Options: "i"}},
				{"port": bson.Regex{Pattern: regexp.QuoteMeta(query), Options: "i"}},
				{"protocol": bson.Regex{Pattern: regexp.QuoteMeta(query), Options: "i"}},
				{"fqdn": bson.Regex{Pattern: regexp.QuoteMeta(query), Options: "i"}},
				{"tag": bson.Regex{Pattern: regexp.QuoteMeta(query), Options: "i"}},
			},
		}
	}
	conditions = append(conditions, orCondition)

	filter := bson.M{
		"$and": conditions,
	}

	cursor, err := ti.collection.Find(context.Background(), filter)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(context.Background())

	targets := []Target{}
	err = cursor.All(context.Background(), &targets)
	if err != nil {
		return nil, err
	}

	for i := range targets {
		err = ti.hydrate(&targets[i])
		if err != nil {
			return nil, err
		}
	}

	return targets, nil
}

// hydrate fills in the nested fields for a Target
func (ti *TargetIndex) hydrate(target *Target) error {
	customer, err := ti.driver.Customer().GetByIDForHydrate(target.Customer.ID)
	if err != nil {
		return err
	}

	target.Customer = *customer

	return nil
}
