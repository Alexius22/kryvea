package mongo

import (
	"errors"

	"go.mongodb.org/mongo-driver/v2/mongo"
)

var (
	ErrImmutableCategory error = errors.New("cannot edit immutable category")
)

func IsDuplicateKeyError(err error) bool {
	return mongo.IsDuplicateKeyError(err)
}
