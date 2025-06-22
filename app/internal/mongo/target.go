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
	targetCollection = "target"
)

var TargetPipeline = mongo.Pipeline{
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

type Target struct {
	Model    `bson:",inline"`
	IPv4     string         `json:"ipv4" bson:"ipv4"`
	IPv6     string         `json:"ipv6" bson:"ipv6"`
	Port     int            `json:"port" bson:"port"`
	Protocol string         `json:"protocol" bson:"protocol"`
	Hostname string         `json:"hostname" bson:"hostname"`
	Name     string         `json:"name" bson:"name"`
	Customer TargetCustomer `json:"customer" bson:"customer"`
}

type TargetCustomer struct {
	ID   uuid.UUID `json:"id" bson:"_id"`
	Name string    `json:"name" bson:"name"`
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
				{Key: "hostname", Value: 1},
				{Key: "name", Value: 1},
			},
			Options: options.Index().SetUnique(true),
		},
	)
	return err
}

func (ti *TargetIndex) Insert(target *Target) (uuid.UUID, error) {
	err := ti.driver.Customer().collection.FindOne(context.Background(), bson.M{"_id": target.Customer.ID}).Err()
	if err != nil {
		return uuid.Nil, err
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
	_, err = ti.collection.InsertOne(context.Background(), target)
	return target.ID, err
}

func (ti *TargetIndex) FirstOrInsert(target *Target) (uuid.UUID, bool, error) {
	var existingTarget Assessment
	err := ti.collection.FindOne(context.Background(), bson.M{"ipv4": target.IPv4, "ipv6": target.IPv6, "hostname": target.Hostname, "name": target.Name}).Decode(&existingTarget)
	if err == nil {
		return existingTarget.ID, false, nil
	}
	if err != mongo.ErrNoDocuments {
		return uuid.Nil, false, err
	}

	id, err := ti.Insert(target)
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
			"hostname":   target.Hostname,
		},
	}

	_, err := ti.collection.UpdateOne(context.Background(), filter, update)
	return err
}

func (ti *TargetIndex) Delete(targetID uuid.UUID) error {
	_, err := ti.collection.DeleteOne(context.Background(), bson.M{"_id": targetID})
	if err != nil {
		return err
	}

	filter := bson.M{"target_id": targetID}
	update := bson.M{
		"$set": bson.M{
			"target_id": uuid.Nil,
		},
	}
	_, err = ti.driver.Vulnerability().collection.UpdateMany(context.Background(), filter, update)
	if err != nil {
		return err
	}

	filter = bson.M{"targets": targetID}
	update = bson.M{
		"$pull": bson.M{
			"targets": targetID,
		},
	}
	_, err = ti.driver.Assessment().collection.UpdateMany(context.Background(), filter, update)
	return err
}

func (ti *TargetIndex) GetByID(targetID uuid.UUID) (*Target, error) {
	pipeline := append(TargetPipeline,
		bson.D{{Key: "$match", Value: bson.M{"_id": targetID}}},
		bson.D{{Key: "$limit", Value: 1}},
	)
	cursor, err := ti.collection.Aggregate(context.Background(), pipeline)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(context.Background())

	var target Target
	if cursor.Next(context.Background()) {
		if err := cursor.Decode(&target); err != nil {
			return nil, err
		}

		return &target, nil
	}

	return nil, mongo.ErrNoDocuments
}

func (ti *TargetIndex) GetByCustomerID(customerID uuid.UUID) ([]Target, error) {
	pipeline := append(TargetPipeline, bson.D{{Key: "$match", Value: bson.M{"customer._id": customerID}}})
	cursor, err := ti.collection.Aggregate(context.Background(), pipeline)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(context.Background())

	var targets []Target
	err = cursor.All(context.Background(), &targets)
	return targets, err
}

func (ti *TargetIndex) GetByCustomerAndID(customerID, targetID uuid.UUID) (*Target, error) {
	pipeline := append(TargetPipeline,
		bson.D{{Key: "$match", Value: bson.M{"customer._id": customerID, "_id": targetID}}},
		bson.D{{Key: "$limit", Value: 1}},
	)
	cursor, err := ti.collection.Aggregate(context.Background(), pipeline)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(context.Background())

	var target Target
	if cursor.Next(context.Background()) {
		if err := cursor.Decode(&target); err != nil {
			return nil, err
		}

		return &target, nil
	}

	return nil, mongo.ErrNoDocuments
}

func (ti *TargetIndex) Search(customerID uuid.UUID, ip string) ([]Target, error) {
	cursor, err := ti.collection.Find(context.Background(), bson.M{"$and": []bson.M{
		{"customer._id": customerID},
		{"$or": []bson.M{
			{"ipv4": bson.Regex{Pattern: regexp.QuoteMeta(ip), Options: "i"}},
			{"ipv6": bson.Regex{Pattern: regexp.QuoteMeta(ip), Options: "i"}},
			{"hostname": bson.Regex{Pattern: regexp.QuoteMeta(ip), Options: "i"}},
		}},
	}})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(context.Background())

	var targets []Target
	err = cursor.All(context.Background(), &targets)
	if err != nil {
		return nil, err
	}

	return targets, nil
}

func (ti *TargetIndex) GetAll() ([]Target, error) {
	cursor, err := ti.collection.Find(context.Background(), bson.M{})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(context.Background())

	var targets []Target
	err = cursor.All(context.Background(), &targets)
	if err != nil {
		return nil, err
	}

	return targets, nil
}
