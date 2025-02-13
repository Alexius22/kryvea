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

var UserPipeline = mongo.Pipeline{
	bson.D{{Key: "$lookup", Value: bson.D{
		{Key: "from", Value: "customer"},
		{Key: "localField", Value: "customers._id"},
		{Key: "foreignField", Value: "_id"},
		{Key: "as", Value: "customerData"},
	}}},
	bson.D{{Key: "$set", Value: bson.D{
		{Key: "customers", Value: bson.D{
			{Key: "$map", Value: bson.D{
				{Key: "input", Value: "$customers"},
				{Key: "as", Value: "customer"},
				{Key: "in", Value: bson.D{
					{Key: "_id", Value: "$$customer._id"},
					{Key: "name", Value: bson.D{
						{Key: "$let", Value: bson.D{
							{Key: "vars", Value: bson.D{
								{Key: "matched", Value: bson.D{
									{Key: "$arrayElemAt", Value: bson.A{
										bson.D{{Key: "$filter", Value: bson.D{
											{Key: "input", Value: "$customerData"},
											{Key: "as", Value: "cust"},
											{Key: "cond", Value: bson.D{
												{Key: "$eq", Value: bson.A{"$$cust._id", "$$customer._id"}},
											}},
										}}},
										0,
									}},
								}},
							}},
							{Key: "in", Value: "$$matched.name"},
						}},
					}},
				}},
			}},
		}},
	}}},
	bson.D{{Key: "$unset", Value: "customerData"}},

	bson.D{{Key: "$lookup", Value: bson.D{
		{Key: "from", Value: "assessment"},
		{Key: "localField", Value: "assessments._id"},
		{Key: "foreignField", Value: "_id"},
		{Key: "as", Value: "assessmentData"},
	}}},
	bson.D{{Key: "$set", Value: bson.D{
		{Key: "assessments", Value: bson.D{
			{Key: "$map", Value: bson.D{
				{Key: "input", Value: "$assessments"},
				{Key: "as", Value: "assessment"},
				{Key: "in", Value: bson.D{
					{Key: "_id", Value: "$$assessment._id"},
					{Key: "name", Value: bson.D{
						{Key: "$let", Value: bson.D{
							{Key: "vars", Value: bson.D{
								{Key: "matched", Value: bson.D{
									{Key: "$arrayElemAt", Value: bson.A{
										bson.D{{Key: "$filter", Value: bson.D{
											{Key: "input", Value: "$assessmentData"},
											{Key: "as", Value: "assess"},
											{Key: "cond", Value: bson.D{
												{Key: "$eq", Value: bson.A{"$$assess._id", "$$assessment._id"}},
											}},
										}}},
										0,
									}},
								}},
							}},
							{Key: "in", Value: "$$matched.name"},
						}},
					}},
				}},
			}},
		}},
	}}},
	bson.D{{Key: "$unset", Value: "assessmentData"}},

	bson.D{{Key: "$project", Value: bson.D{
		{Key: "_id", Value: 1},
		{Key: "created_at", Value: 1},
		{Key: "updated_at", Value: 1},
		{Key: "disabled_at", Value: 1},
		{Key: "username", Value: 1},
		{Key: "role", Value: 1},
		{Key: "customers", Value: 1},
		{Key: "assessments", Value: 1},
	}}},
}

type User struct {
	Model          `bson:",inline"`
	DisabledAt     time.Time         `json:"disabled_at" bson:"disabled_at"`
	Username       string            `json:"username" bson:"username"`
	Password       string            `json:"-" bson:"password"`
	PasswordExpiry time.Time         `json:"-" bson:"password_expiry"`
	Token          string            `json:"-" bson:"token"`
	TokenExpiry    time.Time         `json:"-" bson:"token_expiry"`
	Role           string            `json:"role" bson:"role"`
	Customers      []UserCustomer    `json:"customers" bson:"customers"`
	Assessments    []UserAssessments `json:"assessments" bson:"assessments"`
}

type UserCustomer struct {
	ID   primitive.ObjectID `json:"id" bson:"_id"`
	Name string             `json:"name" bson:"name"`
}

type UserAssessments struct {
	ID   primitive.ObjectID `json:"id" bson:"_id"`
	Name string             `json:"name" bson:"name"`
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

	user.DisabledAt = time.Date(9999, 12, 31, 23, 59, 59, 0, time.UTC)
	user.PasswordExpiry = time.Date(9999, 12, 31, 23, 59, 59, 0, time.UTC)
	user.Role = ROLE_USER
	user.Customers = []UserCustomer{}
	user.Assessments = []UserAssessments{}

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

func (ui *UserIndex) Get(ID primitive.ObjectID) (*User, error) {
	pipeline := append(
		UserPipeline,
		bson.D{{Key: "$match", Value: bson.M{"_id": ID}}},
		bson.D{{Key: "$limit", Value: 1}})
	cursor, err := ui.collection.Aggregate(context.Background(), pipeline)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(context.Background())

	var user User
	if cursor.Next(context.Background()) {
		if err := cursor.Decode(&user); err != nil {
			return nil, err
		}
		return &user, nil
	}

	return nil, mongo.ErrNoDocuments
}

func (ui *UserIndex) GetAll() ([]User, error) {
	cursor, err := ui.collection.Aggregate(context.Background(), UserPipeline)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(context.Background())

	var users []User
	err = cursor.All(context.Background(), &users)
	return users, nil
}

func (ui *UserIndex) GetByToken(token string) (*User, error) {
	opts := options.FindOne().SetProjection(bson.M{
		"password": 0,
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
		"$set": bson.M{},
	}

	if !user.DisabledAt.IsZero() {
		update["$set"].(bson.M)["disabled_at"] = user.DisabledAt
	}

	if user.Username != "" {
		update["$set"].(bson.M)["username"] = user.Username
	}

	if user.Password != "" {
		hash, err := crypto.Encrypt(user.Password)
		if err != nil {
			return err
		}

		update["$set"].(bson.M)["password"] = hash
	}

	if !user.PasswordExpiry.IsZero() {
		update["$set"].(bson.M)["password_expiry"] = user.PasswordExpiry
	}

	if user.Role != "" {
		update["$set"].(bson.M)["role"] = user.Role
	}

	if user.Customers != nil {
		update["$set"].(bson.M)["customers"] = user.Customers
	}

	if user.Assessments != nil {
		update["$set"].(bson.M)["assessments"] = user.Assessments
	}

	user.UpdatedAt = time.Now()

	_, err := ui.collection.UpdateOne(context.Background(), filter, update)
	return err
}

func (ui *UserIndex) Delete(ID primitive.ObjectID) error {
	_, err := ui.collection.DeleteOne(context.Background(), bson.M{"_id": ID})
	return err
}
