package config

import "os"

const (
	addrEnv     = "KRYVEA_ADDR"
	rootPathEnv = "KRYVEA_ROOT_PATH"
	mongoURIEnv = "KRYVEA_MONGO_URI"
)

func GetListeningAddr() string {
	return getEnvConfig(addrEnv, "127.0.0.1:8000")
}

func GetRootPath() string {
	return getEnvConfig(rootPathEnv, "/")
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
