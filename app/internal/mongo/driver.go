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

func NewDriver(uri, adminUser, adminPass string) (*Driver, error) {
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
		d.File(),
		d.FileReference(),
	}

	for _, i := range indexes {
		i.init()
	}

	err = d.CreateAdminUser(adminUser, adminPass)
	if err != nil {
		return nil, err
	}

	return d, nil
}

func (d *Driver) CreateAdminUser(adminUser, adminPass string) error {
	user, err := d.User().GetByUsername(adminUser)
	if err != nil && err != mongo.ErrNoDocuments {
		return err
	}
	if user == nil {
		userID, err := d.User().Insert(&User{
			Username: adminUser,
			Password: adminPass,
		})
		if err != nil {
			return err
		}

		err = d.User().Update(userID, &User{
			Role: ROLE_ADMIN,
		})
		if err != nil {
			return err
		}
	}
	return nil
}
