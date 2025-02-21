package mongo

import (
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type Model struct {
	ID        bson.ObjectID `json:"id" bson:"_id"`
	CreatedAt time.Time     `json:"created_at" bson:"created_at"`
	UpdatedAt time.Time     `json:"updated_at" bson:"updated_at"`
}
