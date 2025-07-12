package mongo

import (
	"context"
	"crypto/md5"
	"time"

	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

const (
	fileReferenceCollection = "file_reference"
)

type FileReference struct {
	Model    `bson:",inline"`
	File     bson.ObjectID `json:"file" bson:"file"`
	Checksum [16]byte      `json:"checksum" bson:"checksum"`
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
	checksum := md5.Sum(data)
	reference, err := i.GetByChecksum(checksum)
	if err != nil && err != mongo.ErrNoDocuments {
		return uuid.Nil, err
	}
	if reference != nil {
		return reference.ID, nil
	}

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
		File:     fileID,
		Checksum: checksum,
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

func (i *FileReferenceIndex) GetByChecksum(checksum [16]byte) (*FileReference, error) {
	var fileReference FileReference
	err := i.collection.FindOne(context.Background(), bson.M{"checksum": checksum}).Decode(&fileReference)
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

	relatedPocs, err := i.driver.Poc().CountByFileReferenceID(id)
	if err != nil {
		return err
	}
	if relatedPocs > 1 {
		return nil
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
