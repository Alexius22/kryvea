package mongo

import (
	"bytes"
	"context"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type FileIndex struct {
	driver *Driver
}

func (d *Driver) File() *FileIndex {
	return &FileIndex{
		driver: d,
	}
}

func (i *FileIndex) init() error { return nil }

func (i *FileIndex) Insert(data []byte) (bson.ObjectID, error) {
	id, err := i.driver.bucket.UploadFromStream(context.Background(), "", bytes.NewReader(data))
	return id, err
}

func (i *FileIndex) GetByID(id bson.ObjectID) ([]byte, error) {
	var buf bytes.Buffer
	_, err := i.driver.bucket.DownloadToStream(context.Background(), id, &buf)
	return buf.Bytes(), err
}

func (i *FileIndex) Delete(id bson.ObjectID) error {
	return i.driver.bucket.Delete(context.Background(), id)
}
