package mongo

import (
	"errors"

	"go.mongodb.org/mongo-driver/v2/mongo"
)

var (
	ErrDuplicateKey     error = errors.New("duplicate key")
	ErrBulkDuplicateKey error = errors.New("bulk duplicate key")
)

func enrichError(err error) error {
	if we, ok := err.(mongo.WriteException); ok {
		for _, e := range we.WriteErrors {
			if e.Code == 11000 {
				return ErrDuplicateKey
			}
		}
	}
	if bwe, ok := err.(mongo.BulkWriteException); ok {
		for _, e := range bwe.WriteErrors {
			if e.Code == 11000 {
				return ErrBulkDuplicateKey
			}
		}
	}
	return nil
}
