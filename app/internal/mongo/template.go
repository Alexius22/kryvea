package mongo

import (
	"context"
	"time"

	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

const (
	templateCollection = "template"
)

var (
	TemplateTypeXlsx           = "xlsx"
	TemplateTypeDocx           = "docx"
	TemplateTypeZip            = "generic-zip"
	XlsxMimeType               = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
	DocxMimeType               = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
	ZipMimeType                = "application/zip"
	SupportedTemplateMimeTypes = map[string]string{
		XlsxMimeType: TemplateTypeXlsx,
		DocxMimeType: TemplateTypeDocx,
		ZipMimeType:  TemplateTypeZip,
	}
)

var TemplatePipeline = mongo.Pipeline{
	bson.D{
		{Key: "$lookup", Value: bson.D{
			{Key: "from", Value: "customer"},
			{Key: "localField", Value: "customer._id"},
			{Key: "foreignField", Value: "_id"},
			{Key: "as", Value: "customerData"},
		}},
	},
	bson.D{
		{Key: "$set", Value: bson.D{
			{Key: "customer", Value: bson.D{
				{Key: "$arrayElemAt", Value: bson.A{"$customerData", 0}},
			}},
		}},
	},
	bson.D{
		{Key: "$unset", Value: "customerData"},
	},
}

type Template struct {
	Model    `bson:",inline"`
	Name     string    `json:"name" bson:"name"`
	Filename string    `json:"filename" bson:"filename"`
	Language string    `json:"language" bson:"language"`
	FileType string    `json:"file_type" bson:"file_type"`
	Type     string    `json:"type" bson:"type"`
	FileID   uuid.UUID `json:"file_id" bson:"file_id"`
	Customer *Customer `json:"customer,omitempty" bson:"customer"`
}

type TemplateIndex struct {
	driver     *Driver
	collection *mongo.Collection
}

func (d *Driver) Template() *TemplateIndex {
	return &TemplateIndex{
		driver:     d,
		collection: d.database.Collection(templateCollection),
	}
}

func (ti TemplateIndex) init() error {
	_, err := ti.collection.Indexes().CreateOne(
		context.Background(),
		mongo.IndexModel{
			Keys: bson.D{
				{Key: "name", Value: 1},
				{Key: "filename", Value: 1},
				{Key: "language", Value: 1},
				{Key: "file_type", Value: 1},
				{Key: "type", Value: 1},
			},
			Options: options.Index().SetUnique(true),
		},
	)
	return err
}

func (ti *TemplateIndex) Insert(template *Template) (uuid.UUID, error) {
	id, err := uuid.NewRandom()
	if err != nil {
		return uuid.Nil, err
	}

	template.Model = Model{
		ID:        id,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	_, err = ti.collection.InsertOne(context.Background(), template)
	if err != nil {
		return uuid.Nil, err
	}

	return template.ID, err
}

func (ti *TemplateIndex) GetByID(id uuid.UUID) (*Template, error) {
	var template Template
	err := ti.collection.FindOne(context.Background(), bson.D{{Key: "_id", Value: id}}).Decode(&template)
	if err != nil {
		return nil, err
	}

	return &template, nil
}

func (ti *TemplateIndex) GetByCustomerID(customerID uuid.UUID) ([]Template, error) {
	cursor, err := ti.collection.Aggregate(context.Background(), mongo.Pipeline{
		bson.D{{Key: "$match", Value: bson.D{{Key: "customer._id", Value: customerID}}}},
		bson.D{{Key: "$sort", Value: bson.D{{Key: "created_at", Value: -1}}}},
	})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(context.Background())

	var templates []Template
	if err = cursor.All(context.Background(), &templates); err != nil {
		return nil, err
	}

	return templates, nil
}

func (ti *TemplateIndex) GetByFileID(fileID uuid.UUID) (*Template, error) {
	var template Template
	err := ti.collection.FindOne(context.Background(), bson.D{{Key: "file_id", Value: fileID}}).Decode(&template)
	if err != nil {
		return nil, err
	}

	return &template, nil
}

func (ti *TemplateIndex) GetAll() ([]Template, error) {
	cursor, err := ti.collection.Aggregate(context.Background(), TemplatePipeline)
	if err != nil {
		ti.driver.logger.Error().Err(err).Msg("Failed to aggregate templates")
		return nil, err
	}
	defer cursor.Close(context.Background())

	var templates []Template
	if err = cursor.All(context.Background(), &templates); err != nil {
		ti.driver.logger.Error().Err(err).Msg("Failed to decode templates")
		return nil, err
	}

	return templates, nil
}

func (ti *TemplateIndex) Delete(id uuid.UUID) error {
	_, err := ti.collection.DeleteOne(context.Background(), bson.D{{Key: "_id", Value: id}})
	return err
}
