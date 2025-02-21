package mongo

import (
	"bytes"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

const (
	filesCollection = "files"
)

type FileIndex struct {
	driver *Driver
}

func (d *Driver) File() *FileIndex {
	return &FileIndex{
		driver: d,
	}
}

func (i *FileIndex) init() {}

func (i *FileIndex) Insert(data []byte) (primitive.ObjectID, error) {
	id, err := i.driver.bucket.UploadFromStream("", bytes.NewReader(data))
	return id, err
}

// TODO: Fix
func (i *FileIndex) GetByID(id primitive.ObjectID) ([]byte, error) {
	var buf bytes.Buffer
	_, err := i.driver.bucket.DownloadToStream(id, &buf)
	return buf.Bytes(), err
}

func (i *FileIndex) Delete(id primitive.ObjectID) error {
	return i.driver.bucket.Delete(id)
}
