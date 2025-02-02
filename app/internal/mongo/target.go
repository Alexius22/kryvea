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
	targetCollection = "target"
)

type Target struct {
	Model      `bson:",inline"`
	IP         string             `json:"ip" bson:"ip"`
	Port       int                `json:"port" bson:"port"`
	Protocol   string             `json:"protocol" bson:"protocol"`
	Hostname   string             `json:"hostname" bson:"hostname"`
	Name       string             `json:"name" bson:"name"`
	CustomerID primitive.ObjectID `json:"customer_id" bson:"customer_id"`
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
				{Key: "ip", Value: 1},
				{Key: "hostname", Value: 1},
				{Key: "name", Value: 1},
			},
			Options: options.Index().SetUnique(true),
		},
	)
	return err
}

func (ti *TargetIndex) Insert(target *Target) (primitive.ObjectID, error) {
	err := ti.driver.Customer().collection.FindOne(context.Background(), bson.M{"_id": target.CustomerID}).Err()
	if err != nil {
		return primitive.NilObjectID, err
	}

	target.Model = Model{
		ID:        primitive.NewObjectID(),
		UpdatedAt: time.Now(),
		CreatedAt: time.Now(),
	}
	_, err = ti.collection.InsertOne(context.Background(), target)
	return target.ID, err
}

func (ti *TargetIndex) Update(targetID primitive.ObjectID, target *Target) error {
	filter := bson.M{"_id": targetID}

	update := bson.M{
		"$set": bson.M{
			"updated_at": time.Now(),
			"ip":         target.IP,
			"port":       target.Port,
			"protocol":   target.Protocol,
			"hostname":   target.Hostname,
		},
	}

	_, err := ti.collection.UpdateOne(context.Background(), filter, update)
	return err
}

func (ti *TargetIndex) Delete(targetID primitive.ObjectID) error {
	_, err := ti.collection.DeleteOne(context.Background(), bson.M{"_id": targetID})
	if err != nil {
		return err
	}

	filter := bson.M{"target_id": targetID}
	update := bson.M{
		"$set": bson.M{
			"target_id": primitive.NilObjectID,
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

func (ti *TargetIndex) GetByID(targetID primitive.ObjectID) (*Target, error) {
	var target Target
	err := ti.collection.FindOne(context.Background(), bson.M{"_id": targetID}).Decode(&target)
	if err != nil {
		return nil, err
	}

	return &target, nil
}

func (ti *TargetIndex) GetByCustomerID(customerID primitive.ObjectID) ([]Target, error) {
	cursor, err := ti.collection.Find(context.Background(), bson.M{"customer_id": customerID})
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

func (ti *TargetIndex) Search(customerID primitive.ObjectID, ip string) ([]Target, error) {
	cursor, err := ti.collection.Find(context.Background(), bson.M{"$and": []bson.M{
		{"customer_id": customerID},
		{"$or": []bson.M{
			{"ip": primitive.Regex{Pattern: regexp.QuoteMeta(ip), Options: "i"}},
			{"hostname": primitive.Regex{Pattern: regexp.QuoteMeta(ip), Options: "i"}},
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
