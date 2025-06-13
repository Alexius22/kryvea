package mongo

import (
	"context"
	"time"

	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

const (
	fileReferenceCollection = "file_reference"
)

type FileReference struct {
	Model `bson:",inline"`
	File  bson.ObjectID `json:"file" bson:"file"`
}

type FileReferenceIndex struct {
	driver     *Driver
	collection *mongo.Collection
}

func (d *Driver) FileReference() *FileReferenceIndex {
	return &FileReferenceIndex{
		driver:     d,
		collection: d.database.Collection(fileReferenceCollection),
	}
}

func (fri FileReferenceIndex) init() error {
	_, err := fri.collection.Indexes().CreateOne(
		context.Background(),
		mongo.IndexModel{},
	)
	return err
}

func (i *FileReferenceIndex) Insert(data []byte) (uuid.UUID, error) {
	id, err := uuid.NewRandom()
	if err != nil {
		return uuid.Nil, err
	}

	fileID, err := i.driver.File().Insert(data)
	if err != nil {
		return uuid.Nil, err
	}

	fileReference := FileReference{
		Model: Model{
			ID:        id,
			CreatedAt: time.Now(),
		},
		File: fileID,
	}
	fileReference.Model.UpdatedAt = fileReference.Model.CreatedAt

	_, err = i.collection.InsertOne(context.Background(), fileReference)
	if err != nil {
		return uuid.Nil, err
	}

	return id, nil
}

func (i *FileReferenceIndex) GetByID(id uuid.UUID) (*FileReference, error) {
	var fileReference FileReference
	err := i.collection.FindOne(context.Background(), bson.M{"_id": id}).Decode(&fileReference)
	if err != nil {
		return nil, err
	}

	return &fileReference, nil
}

func (i *FileReferenceIndex) ReadByID(id uuid.UUID) ([]byte, error) {
	fileReference, err := i.GetByID(id)
	if err != nil {
		return nil, err
	}

	return i.driver.File().GetByID(fileReference.File)
}

func (i *FileReferenceIndex) Delete(id uuid.UUID) error {
	fileReference, err := i.GetByID(id)
	if err != nil {
		return err
	}

	err = i.driver.File().Delete(fileReference.File)
	if err != nil {
		return err
	}

	_, err = i.collection.DeleteOne(context.Background(), bson.M{"_id": id})
	if err != nil {
		return err
	}

	return nil
}

func (i *FileReferenceIndex) Clone(fileID uuid.UUID) (uuid.UUID, error) {
	fileReference, err := i.GetByID(fileID)
	if err != nil {
		return uuid.Nil, err
	}

	newFileID, err := i.driver.File().Clone(fileReference.File)
	if err != nil {
		return uuid.Nil, err
	}

	id, err := uuid.NewRandom()
	if err != nil {
		return uuid.Nil, err
	}

	newFileReference := FileReference{
		Model: Model{
			ID:        id,
			CreatedAt: time.Now(),
		},
		File: newFileID,
	}
	newFileReference.Model.UpdatedAt = newFileReference.Model.CreatedAt

	_, err = i.collection.InsertOne(context.Background(), newFileReference)
	if err != nil {
		return uuid.Nil, err
	}

	return id, nil
}
