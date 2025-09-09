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
	pocCollection = "poc"
)

type Poc struct {
	Model           `bson:",inline"`
	Pocs            []PocItem `json:"pocs" bson:"pocs"`
	VulnerabilityID uuid.UUID `json:"vulnerability_id" bson:"vulnerability_id"`
}

type PocItem struct {
	Index              int               `json:"index" bson:"index"`
	Type               string            `json:"type" bson:"type"`
	Description        string            `json:"description" bson:"description"`
	URI                string            `json:"uri,omitempty" bson:"uri,omitempty"`
	Request            string            `json:"request,omitempty" bson:"request,omitempty"`
	RequestHighlights  []HighlightedText `json:"request_highlights,omitempty" bson:"request_highlights,omitempty"`
	Response           string            `json:"response,omitempty" bson:"response,omitempty"`
	ResponseHighlights []HighlightedText `json:"response_highlights,omitempty" bson:"response_highlights,omitempty"`
	ImageID            uuid.UUID         `json:"image_id,omitempty" bson:"image_id,omitempty"`
	ImageFilename      string            `json:"image_filename,omitempty" bson:"image_filename,omitempty"`
	ImageCaption       string            `json:"image_caption,omitempty" bson:"image_caption,omitempty"`
	TextLanguage       string            `json:"text_language,omitempty" bson:"text_language,omitempty"`
	TextData           string            `json:"text_data,omitempty" bson:"text_data,omitempty"`
	TextHighlights     []HighlightedText `json:"text_highlights,omitempty" bson:"text_highlights,omitempty"`
	// Only populated on report generation
	ImageData []byte `json:"-" bson:"-"`
}

type HighlightedText struct {
	Start           LineCol `json:"start" bson:"start"`
	End             LineCol `json:"end" bson:"end"`
	SelectedPreview string  `json:"selectionPreview" bson:"selection_preview"`
	Color           string  `json:"color" bson:"color"`
}

type LineCol struct {
	Line uint `json:"line" bson:"line"`
	Col  uint `json:"col" bson:"col"`
}

type PocIndex struct {
	driver     *Driver
	collection *mongo.Collection
}

func (d *Driver) Poc() *PocIndex {
	return &PocIndex{
		driver:     d,
		collection: d.database.Collection(pocCollection),
	}
}

func (pi PocIndex) init() error {
	_, err := pi.collection.Indexes().CreateOne(
		context.Background(),
		mongo.IndexModel{
			Keys: bson.D{
				{Key: "vulnerability_id", Value: 1},
			},
			Options: options.Index().SetUnique(true),
		},
	)
	return err
}

func (pi *PocIndex) Upsert(poc *Poc) error {
	// retrieve existing POCs
	oldPoc, err := pi.GetByID(poc.ID)
	if err != nil && err != mongo.ErrNoDocuments {
		return err
	}

	// map new POC image IDs
	newImageIDs := make(map[uuid.UUID]struct{}, len(poc.Pocs))
	for _, newPocs := range poc.Pocs {
		if newPocs.ImageID == uuid.Nil {
			continue
		}

		newImageIDs[newPocs.ImageID] = struct{}{}
	}

	// retrieve old POC images IDs that are not in the new POC
	oldImageIDs := make(map[uuid.UUID]struct{}, len(oldPoc.Pocs))
	for _, oldPocs := range oldPoc.Pocs {
		if _, exists := newImageIDs[oldPocs.ImageID]; !exists {
			oldImageIDs[oldPocs.ImageID] = struct{}{}
		}
	}

	poc.UpdatedAt = time.Now()

	// Serialize without _id
	updateSet := bson.M{
		"pocs":             poc.Pocs,
		"vulnerability_id": poc.VulnerabilityID,
		"updated_at":       poc.UpdatedAt,
	}
	insertSet := bson.M{
		"_id":        uuid.New(),
		"created_at": time.Now(),
	}

	filter := bson.M{"vulnerability_id": poc.VulnerabilityID}
	upsert := bson.M{
		"$set":         updateSet,
		"$setOnInsert": insertSet,
	}

	_, err = pi.collection.UpdateOne(
		context.Background(),
		filter,
		upsert,
		options.UpdateOne().SetUpsert(true),
	)
	if err != nil {
		return err
	}

	// delete old images that are not in the new POC
	for imageID := range oldImageIDs {
		if imageID != uuid.Nil {
			err = pi.driver.FileReference().Delete(imageID, poc.ID)
			if err != nil {
				return err
			}
		}
	}

	return nil
}

func (pi *PocIndex) GetByID(vulnerabilityID uuid.UUID) (*Poc, error) {
	cursor, err := pi.collection.Find(context.Background(), bson.M{"vulnerability_id": vulnerabilityID})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(context.Background())

	poc := &Poc{
		Pocs: []PocItem{},
	}
	if cursor.Next(context.Background()) {
		if err := cursor.Decode(poc); err != nil {
			return nil, err
		}
	}

	return poc, nil
}

func (pi *PocIndex) GetByVulnerabilityID(vulnerabilityID uuid.UUID) (*Poc, error) {
	filter := bson.M{"vulnerability_id": vulnerabilityID}
	opts := options.Find().SetLimit(1)

	cursor, err := pi.collection.Find(context.Background(), filter, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(context.Background())

	poc := &Poc{
		Pocs: []PocItem{},
	}
	if cursor.Next(context.Background()) {
		if err := cursor.Decode(poc); err != nil {
			return nil, err
		}
	}

	return poc, nil
}

func (pi *PocIndex) GetByImageID(imageID uuid.UUID) ([]Poc, error) {
	cursor, err := pi.collection.Find(context.Background(), bson.M{"pocs.image_id": imageID})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(context.Background())

	pocs := []Poc{}
	err = cursor.All(context.Background(), &pocs)
	if err != nil {
		return []Poc{}, err
	}

	return pocs, nil
}

func (pi *PocIndex) DeleteByVulnerabilityID(vulnerabilityID uuid.UUID) error {
	// TODO: add deletion of FileReferences
	_, err := pi.collection.DeleteOne(context.Background(), bson.M{"vulnerability_id": vulnerabilityID})
	return err
}

func (pi *PocIndex) Clone(poc *Poc) (uuid.UUID, error) {
	// // Clone Image
	// if poc.ImageID != uuid.Nil {
	// 	imageID, err := pi.driver.FileReference().Clone(poc.ImageID)
	// 	if err != nil {
	// 		return uuid.Nil, err
	// 	}

	// 	poc.ImageID = imageID
	// }

	id, err := uuid.NewRandom()
	if err != nil {
		return uuid.Nil, err
	}

	poc.ID = id
	poc.CreatedAt = time.Now()
	poc.UpdatedAt = poc.CreatedAt

	_, err = pi.collection.InsertOne(context.Background(), poc)
	return poc.ID, err
}
