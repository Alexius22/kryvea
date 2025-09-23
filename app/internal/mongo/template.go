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

type Template struct {
	Model    `bson:",inline"`
	Name     string    `json:"name" bson:"name"`
	Filename string    `json:"filename,omitempty" bson:"filename"`
	Language string    `json:"language,omitempty" bson:"language"`
	MimeType string    `json:"mime_type" bson:"mime_type"`
	Type     string    `json:"type,omitempty" bson:"type"`
	FileID   uuid.UUID `json:"file_id,omitempty" bson:"file_id"`
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

	templates := []Template{}
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
	filter := bson.M{}
	cursor, err := ti.collection.Find(context.Background(), filter)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(context.Background())

	templates := []Template{}
	err = cursor.All(context.Background(), &templates)
	if err != nil {
		return nil, err
	}

	for i := range templates {
		err = ti.hydrate(&templates[i])
		if err != nil {
			return nil, err
		}
	}

	return templates, nil
}

func (ti *TemplateIndex) Delete(id uuid.UUID) error {
	template, err := ti.GetByID(id)
	if err != nil {
		return err
	}

	// Delete File Reference
	err = ti.driver.FileReference().Delete(template.FileID, template.ID)
	if err != nil {
		return err
	}

	_, err = ti.collection.DeleteOne(context.Background(), bson.D{{Key: "_id", Value: id}})
	return err
}

// hydrate fills in the nested fields for a Template
func (ti *TemplateIndex) hydrate(template *Template) error {
	// customer is optional
	if template.Customer.ID != uuid.Nil {
		var customer Customer
		err := ti.driver.Customer().collection.FindOne(context.Background(), bson.M{"_id": template.Customer.ID}).Decode(&customer)
		if err != nil {
			return err
		}

		template.Customer = &customer
	}

	return nil
}
