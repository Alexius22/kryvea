package mongo

import (
	"context"
	"errors"
	"time"

	"github.com/Alexius22/kryvea/internal/crypto"
	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var (
	ErrInvalidCredentials = errors.New("invalid credentials")
)

const (
	userCollection = "user"
)

type User struct {
	Model          `bson:",inline"`
	Username       string    `json:"username" bson:"username"`
	Password       string    `json:"-" bson:"password"`
	PasswordExpiry time.Time `json:"-" bson:"password_expiry"`
	Token          string    `json:"-" bson:"token"`
	TokenExpiry    time.Time `json:"-" bson:"token_expiry"`
}

type UserIndex struct {
	driver     *Driver
	collection *mongo.Collection
}

func (d *Driver) User() *UserIndex {
	return &UserIndex{
		driver:     d,
		collection: d.database.Collection(userCollection),
	}
}

func (ui UserIndex) init() error {
	_, err := ui.collection.Indexes().CreateOne(
		context.Background(),
		mongo.IndexModel{
			Keys: bson.D{
				{Key: "username", Value: 1},
			},
			Options: options.Index().SetUnique(true),
		},
	)
	return err
}

func (ui *UserIndex) Insert(user *User) error {
	user.Model = Model{
		ID:        primitive.NewObjectID(),
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	user.PasswordExpiry = time.Time{}

	hash, err := crypto.Encrypt(user.Password)
	if err != nil {
		return err
	}
	user.Password = hash

	_, err = ui.collection.InsertOne(context.Background(), user)
	return err
}

func (ui *UserIndex) Login(username, password string) (string, time.Time, error) {
	var user User
	if err := ui.collection.FindOne(context.Background(), bson.M{"username": username}).Decode(&user); err != nil {
		return "", time.Time{}, ErrInvalidCredentials
	}

	if !crypto.Compare(password, user.Password) {
		return "", time.Time{}, ErrInvalidCredentials
	}

	token := uuid.New().String()
	expires := time.Now().Add(9 * time.Hour)

	_, err := ui.collection.UpdateOne(context.Background(), bson.M{"username": username}, bson.M{
		"$set": bson.M{
			"token":        token,
			"token_expiry": expires,
		}})
	if err != nil {
		return "", time.Time{}, err
	}

	return token, expires, nil
}

func (ui *UserIndex) GetAllUsers() ([]User, error) {
	opts := options.Find().SetProjection(bson.M{
		"_id":        1,
		"created_at": 1,
		"updated_at": 1,
		"username":   1,
	})

	var users []User
	cursor, err := ui.collection.Find(context.Background(), bson.M{}, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(context.Background())

	for cursor.Next(context.Background()) {
		var user User
		if err := cursor.Decode(&user); err != nil {
			return nil, err
		}
		users = append(users, user)
	}

	return users, nil
}
