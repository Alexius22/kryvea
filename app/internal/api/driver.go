package api

import "github.com/Alexius22/kryvea/internal/mongo"

type Driver struct {
	mongo *mongo.Driver
}

func NewDriver(mongo *mongo.Driver) *Driver {
	return &Driver{
		mongo: mongo,
	}
}
