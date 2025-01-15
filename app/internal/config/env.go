package config

import "os"

const (
	addrEnv     = "KRYVEA_ADDR"
	pathEnv     = "KRYVEA_PATH"
	mongoURIEnv = "KRYVEA_MONGO_URI"
)

func GetListeningAddr() string {
	return getEnvConfig(addrEnv, "127.0.0.1:8000")
}

func GetPath() string {
	return getEnvConfig(pathEnv, "/")
}

func GetMongoURI() string {
	return getEnvConfig(mongoURIEnv, "mongodb://user:password@host:27017")
}

func getEnvConfig(envName, defaultValue string) string {
	value := os.Getenv(envName)
	if value != "" {
		return value
	}

	return defaultValue
}
