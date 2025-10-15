package mongo

import (
	"context"
	"fmt"
	"time"

	"github.com/Alexius22/kryvea/internal/crypto"
	"github.com/google/uuid"
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
		logger.Error().Err(err).Msg("Failed to connect to MongoDB")
		return nil, err
	}

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()
	err = client.Ping(ctx, nil)
	if err != nil {
		logger.Error().Err(err).Msg("Failed to ping MongoDB")
		return nil, err
	}
	if ctx.Err() == context.DeadlineExceeded {
		logger.Error().Msg("MongoDB connection timed out")
		return nil, fmt.Errorf("MongoDB connection timed out")
	}

	logger.Debug().Msg("Connected to MongoDB")

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

	isInitialized, err := d.IsDbInitialized()
	if err != nil {
		return nil, err
	}

	if !isInitialized {
		err = d.CreateAdminUser(adminUser, adminPass)
		if err != nil {
			return nil, err
		}
	}

	err = d.CreateNilCategory()
	if err != nil {
		return nil, err
	}

	err = d.CreateSetting()
	if err != nil {
		return nil, err
	}

	return d, nil
}

func (d *Driver) IsDbInitialized() (bool, error) {
	_, err := d.Category().GetByID(ImmutableCategoryID)
	if err != nil && err != mongo.ErrNoDocuments {
		return false, err
	}

	if err == mongo.ErrNoDocuments {
		return false, nil
	}

	return true, nil
}

func (d *Driver) CreateSetting() error {
	setting, err := d.Setting().Get()
	if err != nil && err != mongo.ErrNoDocuments {
		return err
	}

	// setting already exists
	if setting != nil {
		return nil
	}

	now := time.Now()

	_, err = d.Setting().collection.InsertOne(context.Background(), &Setting{
		Model: Model{
			ID:        SettingID,
			CreatedAt: now,
			UpdatedAt: now,
		},
		MaxImageSize:            20 * 1024 * 1024,
		MaxImageSizeMB:          20,
		DefaultCategoryLanguage: "en",
	})
	if err != nil {
		return err
	}
	d.logger.Debug().Msg("Created setting")

	return nil
}

func (d *Driver) CreateAdminUser(username, password string) error {
	user, err := d.User().GetByUsername(username)
	if err != nil && err != mongo.ErrNoDocuments {
		return err
	}

	// user already exists
	if user != nil {
		return nil
	}

	id, err := uuid.NewRandom()
	if err != nil {
		return err
	}

	adminUser := User{
		Model: Model{
			ID:        id,
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		},
		DisabledAt:     TimeNever,
		Username:       username,
		PasswordExpiry: time.Now(),
		Role:           RoleAdmin,
		Customers:      []Customer{},
		Assessments:    []Assessment{},
	}

	hash, err := crypto.Encrypt(password)
	if err != nil {
		return err
	}
	adminUser.Password = hash

	_, err = d.User().collection.InsertOne(context.Background(), adminUser)
	if err != nil {
		return err
	}

	d.logger.Debug().Msgf("Created %s user %s", RoleAdmin, username)

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

	now := time.Now()

	_, err = d.Category().collection.InsertOne(context.Background(), &Category{
		Model: Model{
			ID:        ImmutableCategoryID,
			CreatedAt: now,
			UpdatedAt: now,
		},
		Identifier: "KRYVEA",
		Name:       "DELETED-CATEGORY",
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
