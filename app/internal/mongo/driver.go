package mongo

import (
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

type Driver struct {
	client   *mongo.Client
	database *mongo.Database
	bucket   *mongo.GridFSBucket
}

func NewDriver(uri string) (*Driver, error) {
	client, err := mongo.Connect(options.Client().ApplyURI(uri))
	if err != nil {
		return nil, err
	}

	d := &Driver{
		client:   client,
		database: client.Database("kryvea"),
	}

	d.bucket = d.database.GridFSBucket()

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

	user, err := d.User().GetByUsername("kryvea")
	if err != nil && err != mongo.ErrNoDocuments {
		return nil, err
	}
	if user == nil {
		userID, err := d.User().Insert(&User{
			Username: "kryvea",
			Password: "kryveapassword",
		})
		if err != nil {
			return nil, err
		}

		err = d.User().Update(userID, &User{
			Role: ROLE_ADMIN,
		})
		if err != nil {
			return nil, err
		}
	}

	return d, nil
}
