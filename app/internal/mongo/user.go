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

	ROLE_ADMIN = "admin"
	ROLE_USER  = "user"
)

var (
	ROLES = []string{ROLE_ADMIN, ROLE_USER}
)

type User struct {
	Model            `bson:",inline"`
	DisabledAt       time.Time            `json:"disabled_at" bson:"disabled_at"`
	Username         string               `json:"username" bson:"username"`
	Password         string               `json:"-" bson:"password"`
	PasswordExpiry   time.Time            `json:"-" bson:"password_expiry"`
	Token            string               `json:"-" bson:"token"`
	TokenExpiry      time.Time            `json:"-" bson:"token_expiry"`
	Role             string               `json:"role" bson:"role"`
	Customers        []primitive.ObjectID `json:"customers" bson:"customers"`
	OwnedAssessments []primitive.ObjectID `json:"owned_assessments" bson:"owned_assessments"`
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

	user.DisabledAt = time.Time{}
	user.Role = ROLE_USER
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
		return "", time.Time{}, err
	}

	if !user.PasswordExpiry.IsZero() && user.PasswordExpiry.Before(time.Now()) {
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

func (ui *UserIndex) GetAll() ([]User, error) {
	opts := options.Find().SetProjection(bson.M{
		"_id":         1,
		"created_at":  1,
		"updated_at":  1,
		"disabled_at": 1,
		"username":    1,
		"role":        1,
		"customers":   1,
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

func (ui *UserIndex) GetByToken(token string) (*User, error) {
	opts := options.FindOne().SetProjection(bson.M{
		"_id":             1,
		"created_at":      1,
		"updated_at":      1,
		"disabled_at":     1,
		"username":        1,
		"password_expiry": 1,
		"token_expiry":    1,
		"role":            1,
		"customers":       1,
	})

	var user User
	if err := ui.collection.FindOne(context.Background(), bson.M{"token": token}, opts).Decode(&user); err != nil {
		return nil, err
	}

	return &user, nil
}

func (ui *UserIndex) Update(ID primitive.ObjectID, user *User) error {
	filter := bson.M{"_id": ID}

	update := bson.M{
		"$set": bson.M{
			"updated_at":  time.Now(),
			"disabled_at": user.DisabledAt,
			"username":    user.Username,
			"role":        user.Role,
			"customers":   user.Customers,
		},
	}

	_, err := ui.collection.UpdateOne(context.Background(), filter, update)
	return err
}

func (ui *UserIndex) Delete(ID primitive.ObjectID) error {
	_, err := ui.collection.DeleteOne(context.Background(), bson.M{"_id": ID})
	return err
}
