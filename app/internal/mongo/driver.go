package mongo

import (
	"context"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type Driver struct {
	client   *mongo.Client
	database *mongo.Database
}

func NewDriver(uri string) (*Driver, error) {
	client, err := mongo.Connect(context.Background(),
		options.Client().ApplyURI(uri))
	if err != nil {
		return nil, err
	}

	d := &Driver{
		client:   client,
		database: client.Database("kryvea"),
	}

	indexes := []Index{
		d.Customer(),
		d.Assessment(),
		d.Target(),
		d.Category(),
		d.Vulnerability(),
		d.Poc(),
		d.User(),
	}

	for _, i := range indexes {
		i.init()
	}

	return d, nil
}
