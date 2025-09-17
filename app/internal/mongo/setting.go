package mongo

import (
	"context"
	"time"

	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

var (
	settingCollection = "setting"
)

var (
	SettingID uuid.UUID = [16]byte{
		'K', 'R', 'Y', 'V',
		'E', 'A', '-', 'S',
		'E', 'T', 'T', 'I',
		'N', 'G', 'I', 'D',
	}
)

type Setting struct {
	Model                   `bson:",inline"`
	MaxImageSize            int    `json:"max_image_size" bson:"max_image_size"`
	DefaultCategoryLanguage string `json:"default_category_language" bson:"default_category_language"`
}

type SettingIndex struct {
	driver     *Driver
	collection *mongo.Collection
}

func (d *Driver) Setting() *SettingIndex {
	return &SettingIndex{
		driver:     d,
		collection: d.database.Collection(settingCollection),
	}
}

func (ci SettingIndex) init() error {
	return nil
}

func (si *SettingIndex) Get() (*Setting, error) {
	setting := &Setting{}
	if err := si.collection.FindOne(context.Background(), bson.M{"_id": SettingID}).Decode(&setting); err != nil {
		return nil, err
	}
	return setting, nil
}

func (si *SettingIndex) Update(setting *Setting) error {
	filter := bson.M{"_id": SettingID}

	update := bson.M{
		"$set": bson.M{
			"updated_at":                time.Now(),
			"max_image_size":            setting.MaxImageSize,
			"default_category_language": setting.DefaultCategoryLanguage,
		},
	}

	_, err := si.collection.UpdateOne(context.Background(), filter, update)
	return err
}
