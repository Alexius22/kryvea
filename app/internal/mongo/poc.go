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

type PocItem struct {
	Index        int       `json:"index" bson:"index"`
	Type         string    `json:"type" bson:"type"`
	Description  string    `json:"description" bson:"description"`
	URI          string    `json:"uri,omitempty" bson:"uri,omitempty"`
	Request      string    `json:"request,omitempty" bson:"request,omitempty"`
	Response     string    `json:"response,omitempty" bson:"response,omitempty"`
	ImageID      uuid.UUID `json:"image_id,omitempty" bson:"image_id,omitempty"`
	ImageData    []byte    `json:"image_data,omitempty" bson:"image_data,omitempty"`
	ImageCaption string    `json:"image_caption,omitempty" bson:"image_caption,omitempty"`
	TextLanguage string    `json:"text_language,omitempty" bson:"text_language,omitempty"`
	TextData     string    `json:"text_data,omitempty" bson:"text_data,omitempty"`
}

type Poc struct {
	Model           `bson:",inline"`
	Pocs            []PocItem `json:"pocs" bson:"pocs"`
	VulnerabilityID uuid.UUID `json:"vulnerability_id" bson:"vulnerability_id"`
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

// func (pi *PocIndex) Insert(poc *PocItem) (uuid.UUID, error) {
// 	err := pi.driver.Vulnerability().collection.FindOne(context.Background(), bson.M{"_id": poc.VulnerabilityID}).Err()
// 	if err != nil {
// 		return uuid.Nil, err
// 	}

// 	id, err := uuid.NewRandom()
// 	if err != nil {
// 		return uuid.Nil, err
// 	}

// 	poc.Model = Model{
// 		ID:        id,
// 		UpdatedAt: time.Now(),
// 		CreatedAt: time.Now(),
// 	}
// 	_, err = pi.collection.InsertOne(context.Background(), poc)
// 	return poc.ID, err
// }

// func (pi *PocIndex) InsertMany(pocs []*PocItem, vulnerabilityID uuid.UUID) ([]uuid.UUID, error) {
// 	if len(pocs) == 0 {
// 		return []uuid.UUID{}, nil
// 	}

// 	err := pi.driver.Vulnerability().collection.FindOne(context.Background(), bson.M{"_id": vulnerabilityID}).Err()
// 	if err != nil {
// 		return []uuid.UUID{}, err
// 	}

// 	ids := make([]uuid.UUID, len(pocs))
// 	for i, pocToInsert := range pocs {
// 		// insert images
// 		if pocToInsert.Type == poc.POC_TYPE_IMAGE && len(pocToInsert.ImageData) > 0 {
// 			imageID, err := pi.driver.FileReference().Insert(pocToInsert.ImageData)
// 			if err != nil {
// 				return []uuid.UUID{}, err
// 			}

// 			pocToInsert.ImageID = imageID
// 		}

// 		id, err := uuid.NewRandom()
// 		if err != nil {
// 			return []uuid.UUID{}, err
// 		}
// 		pocToInsert.Model = Model{
// 			ID:        id,
// 			UpdatedAt: time.Now(),
// 			CreatedAt: time.Now(),
// 		}
// 		pocToInsert.VulnerabilityID = vulnerabilityID
// 		ids[i] = id
// 	}

// 	_, err = pi.collection.InsertMany(context.Background(), pocs)
// 	if err != nil {
// 		// delete images if insert failed
// 		for _, pocToDelete := range pocs {
// 			if pocToDelete.ImageID != uuid.Nil {
// 				_ = pi.driver.FileReference().Delete(pocToDelete.ImageID)
// 			}
// 		}
// 		return []uuid.UUID{}, err
// 	}

// 	return ids, nil
// }

// func (pi *PocIndex) Update(ID uuid.UUID, poc *PocItem) error {
// 	filter := bson.M{"_id": ID}

// 	update := bson.M{
// 		"$set": bson.M{},
// 	}

// 	if poc.Index != 0 {
// 		update["$set"].(bson.M)["index"] = poc.Index
// 	}

// 	if poc.Type != "" {
// 		update["$set"].(bson.M)["type"] = poc.Type
// 	}

// 	if poc.Description != "" {
// 		update["$set"].(bson.M)["description"] = poc.Description
// 	}

// 	if poc.URI != "" {
// 		update["$set"].(bson.M)["uri"] = poc.URI
// 	}

// 	if poc.Request != "" {
// 		update["$set"].(bson.M)["request"] = poc.Request
// 	}

// 	if poc.Response != "" {
// 		update["$set"].(bson.M)["response"] = poc.Response
// 	}

// 	if poc.ImageID != uuid.Nil {
// 		update["$set"].(bson.M)["image_id"] = poc.ImageID
// 	}

// 	if poc.ImageCaption != "" {
// 		update["$set"].(bson.M)["caption"] = poc.ImageCaption
// 	}

// 	if poc.TextLanguage != "" {
// 		update["$set"].(bson.M)["language"] = poc.TextLanguage
// 	}

// 	if poc.TextData != "" {
// 		update["$set"].(bson.M)["text_data"] = poc.TextData
// 	}

// 	update["$set"].(bson.M)["updated_at"] = time.Now()

// 	_, err := pi.collection.UpdateOne(context.Background(), filter, update)
// 	return err
// }

func (pi *PocIndex) Upsert(poc *Poc) error {
	// retrieve existing POCs
	oldPoc, err := pi.GetByVulnerabilityID(poc.VulnerabilityID)
	if err != nil && err != mongo.ErrNoDocuments {
		return err
	}

	// map new POC image IDs
	newImageIDs := make(map[uuid.UUID]struct{}, len(poc.Pocs))
	for _, newPocs := range poc.Pocs {
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

	filter := bson.M{"vulnerability_id": poc.VulnerabilityID}
	update := bson.M{
		"$set": updateSet,
		"$setOnInsert": bson.M{
			"_id":        uuid.New(),
			"created_at": time.Now(),
		},
	}

	_, err = pi.collection.UpdateOne(
		context.Background(),
		filter,
		update,
		options.UpdateOne().SetUpsert(true),
	)
	if err != nil {
		return err
	}

	// delete old images that are not in the new POC
	for imageID := range oldImageIDs {
		if imageID != uuid.Nil {
			err = pi.driver.FileReference().Delete(imageID)
			if err != nil {
				return err
			}
		}
	}

	return nil
}

func (pi *PocIndex) GetByVulnerabilityID(vulnerabilityID uuid.UUID) (*Poc, error) {
	poc := Poc{}
	err := pi.collection.FindOne(context.Background(), bson.M{"vulnerability_id": vulnerabilityID}).Decode(&poc)
	if err != nil {
		return &Poc{
			Pocs: []PocItem{},
		}, err
	}

	for i, item := range poc.Pocs {
		if item.ImageID != uuid.Nil {
			imageData, err := pi.driver.FileReference().ReadByID(item.ImageID)
			if err != nil {
				return nil, err
			}
			poc.Pocs[i].ImageData = imageData
		}
	}

	return &poc, nil
}

func (pi *PocIndex) CountByFileReferenceID(fileReferenceID uuid.UUID) (int64, error) {
	count, err := pi.collection.CountDocuments(context.Background(), bson.M{"pocs.image_id": fileReferenceID})
	if err != nil {
		return 0, err
	}
	return count, nil
}

func (pi *PocIndex) DeleteByVulnerabilityID(vulnerabilityID uuid.UUID) error {
	_, err := pi.collection.DeleteOne(context.Background(), bson.M{"vulnerability_id": vulnerabilityID})
	return err
}

// func (pi *PocIndex) GetByID(pocID uuid.UUID) (*PocItem, error) {
// 	var poc PocItem
// 	err := pi.collection.FindOne(context.Background(), bson.M{"_id": pocID}).Decode(&poc)
// 	if err != nil {
// 		return nil, err
// 	}

// 	if poc.ImageID != uuid.Nil {
// 		poc.ImageData, err = pi.driver.FileReference().ReadByID(poc.ImageID)
// 		if err != nil {
// 			return nil, err
// 		}
// 	}

// 	return &poc, nil
// }

// func (pi *PocIndex) GetByVulnerabilityID(vulnerabilityID uuid.UUID) ([]PocItem, error) {
// 	cursor, err := pi.collection.Find(context.Background(), bson.M{"vulnerability_id": vulnerabilityID})
// 	if err != nil {
// 		return []PocItem{}, err
// 	}
// 	defer cursor.Close(context.Background())

// 	pocs := []PocItem{}
// 	for cursor.Next(context.Background()) {
// 		poc := PocItem{}
// 		if err := cursor.Decode(&poc); err != nil {
// 			return []PocItem{}, err
// 		}

// 		if poc.ImageID != uuid.Nil {
// 			poc.ImageData, err = pi.driver.FileReference().ReadByID(poc.ImageID)
// 			if err != nil {
// 				return []PocItem{}, err
// 			}
// 		}

// 		pocs = append(pocs, poc)
// 	}

// 	return pocs, nil
// }

// func (pi *PocIndex) GetByVulnerabilityAndID(vulnerabilityID, pocID uuid.UUID) (*PocItem, error) {
// 	var poc PocItem
// 	err := pi.collection.FindOne(context.Background(), bson.M{"_id": pocID, "vulnerability_id": vulnerabilityID}).Decode(&poc)
// 	if err != nil {
// 		return nil, err
// 	}

// 	if poc.ImageID != uuid.Nil {
// 		poc.ImageData, err = pi.driver.FileReference().ReadByID(poc.ImageID)
// 		if err != nil {
// 			return nil, err
// 		}
// 	}

// 	return &poc, nil
// }

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
