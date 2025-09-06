package mongo

import (
	"context"

	"github.com/rs/zerolog"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

type Driver struct {
	client   *mongo.Client
	database *mongo.Database
	bucket   *mongo.GridFSBucket
	logger   *zerolog.Logger
}

func NewDriver(uri, adminUser, adminPass string, levelWriter *zerolog.LevelWriter) (*Driver, error) {
	logger := zerolog.New(*levelWriter).With().
		Str("source", "mongo-driver").
		Timestamp().Logger()

	client, err := mongo.Connect(options.Client().ApplyURI(uri))
	if err != nil {
		return nil, err
	}

	d := &Driver{
		client:   client,
		database: client.Database("kryvea"),
		logger:   &logger,
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

	err = d.CreateNilCategory()
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

	// user already exists
	if user != nil {
		return nil
	}

	_, err = d.User().Insert(&User{
		Username: adminUser,
		Role:     RoleAdmin,
	}, adminPass)
	if err != nil {
		return err
	}
	d.logger.Debug().Msgf("Created %s user %s", RoleAdmin, adminUser)

	return nil
}

func (d *Driver) CreateNilCategory() error {
	category, err := d.Category().GetByID(ImmutableCategoryID)
	if err != nil && err != mongo.ErrNoDocuments {
		return err
	}

	// category already exists
	if category != nil {
		return nil
	}

	_, err = d.Category().collection.InsertOne(context.Background(), &Category{
		Model: Model{
			ID: ImmutableCategoryID,
		},
		Index: "KRYVEA",
		Name:  "DELETED-CATEGORY",
		GenericDescription: map[string]string{
			"en": "The original category for this vulnerability has been deleted, please select a new one",
		},
		GenericRemediation: map[string]string{
			"en": "",
		},
	})
	if err != nil {
		return err
	}
	d.logger.Debug().Msg("Created nil category")

	return nil
}
