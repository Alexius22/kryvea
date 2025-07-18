package mongo

import (
	"context"
	"errors"
	"time"

	"github.com/Alexius22/kryvea/internal/crypto"
	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

var (
	ErrPasswordExpired    = errors.New("password expired")
	ErrDisabledUser       = errors.New("user is disabled")
	ErrInvalidCredentials = errors.New("invalid credentials")

	TimeNever = time.Date(9999, 12, 31, 23, 59, 59, 0, time.UTC)
)

const (
	userCollection = "user"

	ROLE_ADMIN = "admin"
	ROLE_USER  = "user"

	TOKEN_EXPIRE_TIME       = 9 * time.Hour
	TOKEN_EXTEND_TIME       = 2 * time.Hour
	TOKEN_REFRESH_THRESHOLD = 1 * time.Hour
)

var (
	ROLES = []string{ROLE_ADMIN, ROLE_USER}
)

var UserPipeline = mongo.Pipeline{
	bson.D{
		{Key: "$lookup", Value: bson.D{
			{Key: "from", Value: "customer"},
			{Key: "localField", Value: "customers._id"},
			{Key: "foreignField", Value: "_id"},
			{Key: "as", Value: "customers"},
		}},
	},

	bson.D{
		{Key: "$lookup", Value: bson.D{
			{Key: "from", Value: "assessment"},
			{Key: "localField", Value: "assessments._id"},
			{Key: "foreignField", Value: "_id"},
			{Key: "as", Value: "assessmentData"},
		}},
	},
	bson.D{
		{Key: "$set", Value: bson.D{
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
		}},
	},
	bson.D{{Key: "$unset", Value: "assessmentData"}},

	bson.D{
		{Key: "$project", Value: bson.D{
			{Key: "_id", Value: 1},
			{Key: "created_at", Value: 1},
			{Key: "updated_at", Value: 1},
			{Key: "disabled_at", Value: 1},
			{Key: "username", Value: 1},
			{Key: "role", Value: 1},
			{Key: "customers", Value: 1},
			{Key: "assessments", Value: 1},
		}},
	},
}

type User struct {
	Model            `bson:",inline"`
	DisabledAt       time.Time        `json:"disabled_at" bson:"disabled_at"`
	Username         string           `json:"username" bson:"username"`
	Password         string           `json:"-" bson:"password"`
	PasswordExpiry   time.Time        `json:"-" bson:"password_expiry"`
	ResetToken       string           `json:"-" bson:"reset_token"`
	ResetTokenExpiry time.Time        `json:"-" bson:"reset_token_expiry"`
	Token            uuid.UUID        `json:"-" bson:"token"`
	TokenExpiry      time.Time        `json:"-" bson:"token_expiry"`
	Role             string           `json:"role" bson:"role"`
	Customers        []Customer       `json:"customers" bson:"customers"`
	Assessments      []UserAssessment `json:"assessments" bson:"assessments"`
}

type UserAssessment struct {
	ID   uuid.UUID `json:"id" bson:"_id"`
	Name string    `json:"name" bson:"name"`
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

func (ui *UserIndex) Insert(user *User) (uuid.UUID, error) {
	id, err := uuid.NewRandom()
	if err != nil {
		return uuid.UUID{}, err
	}

	user.Model = Model{
		ID:        id,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	user.DisabledAt = TimeNever
	user.PasswordExpiry = TimeNever

	if user.Customers == nil {
		user.Customers = []Customer{}
	}

	if user.Assessments == nil {
		user.Assessments = []UserAssessment{}
	}

	hash, err := crypto.Encrypt(user.Password)
	if err != nil {
		return uuid.UUID{}, err
	}
	user.Password = hash

	_, err = ui.collection.InsertOne(context.Background(), user)
	return user.ID, err
}

func (ui *UserIndex) Login(username, password string) (uuid.UUID, time.Time, error) {
	var user User
	err := ui.collection.FindOne(context.Background(), bson.M{"username": username}).Decode(&user)
	if err != nil {
		return uuid.UUID{}, time.Time{}, err
	}

	if !crypto.Compare(password, user.Password) {
		return uuid.UUID{}, time.Time{}, ErrInvalidCredentials
	}

	if user.DisabledAt.Before(time.Now()) {
		return uuid.UUID{}, time.Time{}, ErrDisabledUser
	}

	if !user.PasswordExpiry.IsZero() && user.PasswordExpiry.Before(time.Now()) {
		return uuid.UUID{}, time.Time{}, ErrPasswordExpired
	}

	token, err := uuid.NewRandom()
	if err != nil {
		return uuid.UUID{}, time.Time{}, err
	}

	expires := time.Now().Add(TOKEN_EXPIRE_TIME)

	_, err = ui.collection.UpdateOne(context.Background(), bson.M{"username": username}, bson.M{
		"$set": bson.M{
			"token":        token,
			"token_expiry": expires,
		}})
	if err != nil {
		return uuid.UUID{}, time.Time{}, err
	}

	return token, expires, nil
}

func (ui *UserIndex) RefreshUserToken(user *User) (uuid.UUID, time.Time, error) {
	expires := user.TokenExpiry.Add(TOKEN_EXTEND_TIME)

	_, err := ui.collection.UpdateOne(context.Background(), bson.M{"_id": user.ID}, bson.M{
		"$set": bson.M{
			"token_expiry": expires,
		}})
	if err != nil {
		return uuid.UUID{}, time.Time{}, err
	}

	return user.Token, expires, nil
}

func (ui *UserIndex) Logout(ID uuid.UUID) error {
	_, err := ui.collection.UpdateOne(context.Background(), bson.M{"_id": ID}, bson.M{
		"$set": bson.M{
			"token":        "",
			"token_expiry": time.Time{},
		}})
	return err
}

func (ui *UserIndex) Get(ID uuid.UUID) (*User, error) {
	pipeline := append(
		UserPipeline,
		bson.D{{Key: "$match", Value: bson.M{"_id": ID}}},
		bson.D{{Key: "$limit", Value: 1}})
	cursor, err := ui.collection.Aggregate(context.Background(), pipeline)
	if err != nil {
		return &User{}, err
	}
	defer cursor.Close(context.Background())

	user := User{}
	if cursor.Next(context.Background()) {
		if err := cursor.Decode(&user); err != nil {
			return &User{}, err
		}
		return &user, nil
	}

	return nil, mongo.ErrNoDocuments
}

func (ui *UserIndex) GetAll() ([]User, error) {
	cursor, err := ui.collection.Aggregate(context.Background(), UserPipeline)
	if err != nil {
		return []User{}, err
	}
	defer cursor.Close(context.Background())

	users := []User{}
	err = cursor.All(context.Background(), &users)
	return users, err
}

func (ui *UserIndex) GetByToken(token uuid.UUID) (*User, error) {
	opts := options.FindOne().SetProjection(bson.M{
		"password": 0,
	})

	var user User
	if err := ui.collection.FindOne(context.Background(), bson.M{"token": token}, opts).Decode(&user); err != nil {
		return nil, err
	}

	return &user, nil
}

func (ui *UserIndex) GetByUsername(username string) (*User, error) {
	opts := options.FindOne().SetProjection(bson.M{
		"password": 0,
	})

	var user User
	if err := ui.collection.FindOne(context.Background(), bson.M{"username": username}, opts).Decode(&user); err != nil {
		return nil, err
	}

	return &user, nil
}

func (ui *UserIndex) Update(ID uuid.UUID, user *User) error {
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

	update["$set"].(bson.M)["updated_at"] = time.Now()

	_, err := ui.collection.UpdateOne(context.Background(), filter, update)
	return err
}

func (ui *UserIndex) UpdateOwnedAssessment(userID, assessmentID uuid.UUID, isOwned bool) error {
	filter := bson.M{"_id": userID}

	op := "$pull"
	if isOwned {
		op = "$addToSet"
	}

	update := bson.M{
		op: bson.M{
			"assessments": bson.M{
				"_id": assessmentID,
			},
		},
	}

	_, err := ui.collection.UpdateOne(context.Background(), filter, update)
	return err
}

func (ui *UserIndex) Delete(ID uuid.UUID) error {
	_, err := ui.collection.DeleteOne(context.Background(), bson.M{"_id": ID})
	return err
}

func (ui *UserIndex) ResetUserPassword(userID uuid.UUID, newPassword string) (uuid.UUID, error) {
	hash, err := crypto.Encrypt(newPassword)
	if err != nil {
		return uuid.UUID{}, err
	}

	token, err := uuid.NewRandom()
	if err != nil {
		return uuid.UUID{}, err
	}

	expires := time.Now().Add(30 * time.Minute)

	_, err = ui.collection.UpdateOne(context.Background(), bson.M{"_id": userID}, bson.M{
		"$set": bson.M{
			"updated_at":         time.Now(),
			"password":           hash,
			"password_expiry":    time.Now(),
			"reset_token":        token,
			"reset_token_expiry": expires,
		}})
	if err != nil {
		return uuid.UUID{}, err
	}

	return token, nil
}

func (ui *UserIndex) ResetPassword(reset_token uuid.UUID, password string) error {
	var user User
	err := ui.collection.FindOne(context.Background(), bson.M{"reset_token": reset_token}).Decode(&user)
	if err != nil {
		return err
	}

	hash, err := crypto.Encrypt(password)
	if err != nil {
		return err
	}

	_, err = ui.collection.UpdateOne(context.Background(), bson.M{"_id": user.ID}, bson.M{
		"$set": bson.M{
			"updated_at":         time.Now(),
			"password":           hash,
			"password_expiry":    TimeNever,
			"reset_token":        "",
			"reset_token_expiry": time.Time{},
		}})
	return err
}

func (ui *UserIndex) ValidatePassword(ID uuid.UUID, currentPassword string) error {
	opts := options.FindOne().SetProjection(bson.M{
		"password": 1,
	})

	var user User
	err := ui.collection.FindOne(context.Background(), bson.M{"_id": ID}, opts).Decode(&user)
	if err != nil {
		return err
	}

	if !crypto.Compare(currentPassword, user.Password) {
		return ErrInvalidCredentials
	}

	return nil
}
