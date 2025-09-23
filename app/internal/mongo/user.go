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
	ErrDisabledUser       = errors.New("user is disabled")
	ErrInvalidCredentials = errors.New("invalid credentials")

	TimeNever = time.Date(9999, 12, 31, 23, 59, 59, 0, time.UTC)
)

const (
	userCollection = "user"

	RoleAdmin = "admin"
	RoleUser  = "user"

	TokenExpireTime         = 9 * time.Hour
	TokenExpireTimePwdReset = 15 * time.Minute
	TokenExtendTime         = 2 * time.Hour
	TokenRefreshThreshold   = 1 * time.Hour
)

var (
	Roles = []string{RoleAdmin, RoleUser}
)

var UserProjection = bson.M{
	"password":        0,
	"password_expiry": 0,
	"token":           0,
	"token_expiry":    0,
}

type User struct {
	Model          `bson:",inline"`
	DisabledAt     time.Time    `json:"disabled_at,omitempty" bson:"disabled_at"`
	Username       string       `json:"username" bson:"username"`
	Password       []byte       `json:"-" bson:"password"`
	PasswordExpiry time.Time    `json:"-" bson:"password_expiry"`
	Token          crypto.Token `json:"-" bson:"token"`
	TokenExpiry    time.Time    `json:"-" bson:"token_expiry"`
	Role           string       `json:"role" bson:"role"`
	Customers      []Customer   `json:"customers,omitempty" bson:"customers"`
	Assessments    []Assessment `json:"assessments,omitempty" bson:"assessments"`
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

func (ui *UserIndex) Insert(user *User, password string) (uuid.UUID, error) {
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
		user.Assessments = []Assessment{}
	}

	hash, err := crypto.Encrypt(password)
	if err != nil {
		return uuid.UUID{}, err
	}
	user.Password = hash

	_, err = ui.collection.InsertOne(context.Background(), user)
	if err != nil {
		return uuid.Nil, err
	}

	return user.ID, nil
}

func (ui *UserIndex) Login(username, password string) (*User, error) {
	var user User
	err := ui.collection.FindOne(context.Background(), bson.M{"username": username}).Decode(&user)
	if err != nil {
		return nil, err
	}

	if !crypto.Compare(password, user.Password) {
		return nil, ErrInvalidCredentials
	}

	if user.DisabledAt.Before(time.Now()) {
		return nil, ErrDisabledUser
	}

	user.Token = crypto.NewToken()

	user.TokenExpiry = time.Now().Add(TokenExpireTime)
	if user.PasswordExpiry.Before(time.Now()) {
		user.TokenExpiry = time.Now().Add(TokenExpireTimePwdReset)
	}

	_, err = ui.collection.UpdateOne(context.Background(), bson.M{"username": username}, bson.M{
		"$set": bson.M{
			"token":        user.Token,
			"token_expiry": user.TokenExpiry,
		}})
	if err != nil {
		return nil, err
	}

	return &user, nil
}

func (ui *UserIndex) RefreshUserToken(user *User) error {
	user.TokenExpiry = user.TokenExpiry.Add(TokenExtendTime)

	_, err := ui.collection.UpdateOne(context.Background(), bson.M{"_id": user.ID}, bson.M{
		"$set": bson.M{
			"token_expiry": user.TokenExpiry,
		}})
	if err != nil {
		return err
	}

	return nil
}

func (ui *UserIndex) Logout(ID uuid.UUID) error {
	_, err := ui.collection.UpdateOne(context.Background(), bson.M{"_id": ID}, bson.M{
		"$set": bson.M{
			"token":        crypto.TokenNil,
			"token_expiry": time.Time{},
		}})
	return err
}

func (ui *UserIndex) Get(ID uuid.UUID) (*User, error) {
	filter := bson.M{"_id": ID}
	opts := options.FindOne().SetProjection(UserProjection)

	user := &User{}
	err := ui.collection.FindOne(context.Background(), filter, opts).Decode(user)
	if err != nil {
		return nil, err
	}

	err = ui.hydrate(user)
	if err != nil {
		return nil, err
	}

	return user, nil

}

func (ui *UserIndex) GetAll() ([]User, error) {
	filter := bson.M{}
	opts := options.Find().SetProjection(UserProjection)

	cursor, err := ui.collection.Find(context.Background(), filter, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(context.Background())

	users := []User{}
	err = cursor.All(context.Background(), &users)
	if err != nil {
		return nil, err
	}

	for i := range users {
		err = ui.hydrate(&users[i])
		if err != nil {
			return nil, err
		}
	}

	return users, nil
}

func (ui *UserIndex) GetAllUsernames() ([]string, error) {
	opts := options.Find().SetProjection(bson.M{
		"username": 1,
	}).SetSort(bson.M{
		"username": 1,
	})
	cursor, err := ui.collection.Find(context.Background(), bson.M{}, opts)
	if err != nil {
		return []string{}, err
	}
	defer cursor.Close(context.Background())

	usernames := make([]string, 0, cursor.RemainingBatchLength())
	for cursor.Next(context.Background()) {
		var user User
		if err := cursor.Decode(&user); err != nil {
			return []string{}, err
		}

		usernames = append(usernames, user.Username)
	}

	return usernames, err
}

func (ui *UserIndex) GetByToken(token crypto.Token) (*User, error) {
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
		"$set": bson.M{
			"updated_at": time.Now(),
		},
	}

	if !user.DisabledAt.IsZero() {
		update["$set"].(bson.M)["disabled_at"] = user.DisabledAt
	}
	if user.Username != "" {
		update["$set"].(bson.M)["username"] = user.Username
	}
	if user.Role != "" {
		update["$set"].(bson.M)["role"] = user.Role
	}
	if user.Customers != nil {
		update["$set"].(bson.M)["customers"] = user.Customers
	}

	_, err := ui.collection.UpdateOne(context.Background(), filter, update)
	return err
}

func (ui *UserIndex) UpdateMe(userID uuid.UUID, newUser *User, password string) error {
	filter := bson.M{"_id": userID}

	update := bson.M{
		"$set": bson.M{
			"updated_at": time.Now(),
		},
	}

	if newUser.Username != "" {
		update["$set"].(bson.M)["username"] = newUser.Username
	}

	if password != "" {
		hash, err := crypto.Encrypt(password)
		if err != nil {
			return err
		}
		update["$set"].(bson.M)["password"] = hash
	}

	_, err := ui.collection.UpdateOne(context.Background(), filter, update)
	return err
}

func (ui *UserIndex) UpdateOwnedAssessment(userID, assessmentID uuid.UUID, addToOwned bool) error {
	filter := bson.M{"_id": userID}

	op := "$pull"
	if addToOwned {
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

func (ui *UserIndex) ResetUserPassword(userID uuid.UUID, newPassword string) error {
	hash, err := crypto.Encrypt(newPassword)
	if err != nil {
		return err
	}

	_, err = ui.collection.UpdateOne(context.Background(), bson.M{"_id": userID}, bson.M{
		"$set": bson.M{
			"updated_at":      time.Now(),
			"password":        hash,
			"password_expiry": time.Now(),
		}})
	if err != nil {
		return err
	}

	return nil
}

func (ui *UserIndex) ResetPassword(user *User, password string) error {
	hash, err := crypto.Encrypt(password)
	if err != nil {
		return err
	}

	user.UpdatedAt = time.Now()
	user.PasswordExpiry = TimeNever

	user.Token = crypto.NewToken()
	user.TokenExpiry = time.Now().Add(TokenExpireTime)

	_, err = ui.collection.UpdateOne(context.Background(), bson.M{"_id": user.ID}, bson.M{
		"$set": bson.M{
			"updated_at":      user.UpdatedAt,
			"password":        hash,
			"password_expiry": user.PasswordExpiry,
			"token":           user.Token,
			"token_expiry":    user.TokenExpiry,
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

func (u *User) CanAccessCustomer(customer uuid.UUID) bool {
	if u.Role == RoleAdmin {
		return true
	}

	for _, allowedCustomer := range u.Customers {
		if allowedCustomer.ID == customer {
			return true
		}
	}
	return false
}

func IsValidRole(role string) bool {
	if role == "" {
		return false
	}

	for _, r := range Roles {
		if r == role {
			return true
		}
	}

	return false
}

// hydrate fills in the nested fields for a User
func (ui *UserIndex) hydrate(user *User) error {
	// customers are optional
	if len(user.Customers) > 0 {
		customers, err := ui.driver.Customer().GetManyForHydrate(user.Customers)
		if err != nil {
			return err
		}

		user.Customers = customers
	}

	// assessments are optional
	if len(user.Assessments) > 0 {
		assessment, err := ui.driver.Assessment().GetManyForHydrate(user.Assessments)
		if err != nil {
			return err
		}

		user.Assessments = assessment
	}

	return nil
}
