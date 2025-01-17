package util

import "go.mongodb.org/mongo-driver/bson/primitive"

func ParseMongoID(id string) (primitive.ObjectID, error) {
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return primitive.NilObjectID, err
	}
	return objectID, nil
}
