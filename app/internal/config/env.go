package config

import (
	"os"
	"strconv"
)

const (
	addrEnv             = "KRYVEA_ADDR"
	rootPathEnv         = "KRYVEA_ROOT_PATH"
	mongoURIEnv         = "KRYVEA_MONGO_URI"
	adminUserEnv        = "KRYVEA_ADMIN_USER"
	adminPassEnv        = "KRYVEA_ADMIN_PASS"
	logFilePathEnv      = "KRYVEA_LOG_FILE_PATH"
	errorLogFilePathEnv = "KRYVEA_ERROR_LOG_FILE_PATH"
	debugLogFilePathEnv = "KRYVEA_DEBUG_LOG_FILE_PATH"
	logMaxSizeMBEnv     = "KRYVEA_LOG_MAX_SIZE_MB"
	logMaxBackupsEnv    = "KRYVEA_LOG_MAX_BACKUPS"
	logMaxAgeDaysEnv    = "KRYVEA_LOG_MAX_AGE_DAYS"
	logCompressEnv      = "KRYVEA_LOG_COMPRESS"
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

func GetAdminUser() string {
	return getEnvConfig(adminUserEnv, "kryvea")
}

func GetAdminPass() string {
	return getEnvConfig(adminPassEnv, "kryveapassword")
}

func GetLogFilePath() string {
	return getEnvConfig(logFilePathEnv, "/var/log/kryvea/kryvea.log")
}

func GetErrorLogFilePath() string {
	return getEnvConfig(errorLogFilePathEnv, "/var/log/kryvea/kryvea_error.log")
}

func GetDebugLogFilePath() string {
	return getEnvConfig(debugLogFilePathEnv, "/var/log/kryvea/kryvea_debug.log")
}

func GetLogMaxSizeMB() int {
	defaultSize := 10
	size := getEnvConfig(logMaxSizeMBEnv, "")

	maxSize, err := strconv.Atoi(size)
	if err != nil {
		return defaultSize
	}

	return maxSize
}

func GetLogMaxBackups() int {
	defaultBackups := 5
	backups := getEnvConfig(logMaxBackupsEnv, "")

	maxBackups, err := strconv.Atoi(backups)
	if err != nil {
		return defaultBackups
	}

	return maxBackups
}

func GetLogMaxAgeDays() int {
	defaultAge := 0
	age := getEnvConfig(logMaxAgeDaysEnv, "")

	maxAge, err := strconv.Atoi(age)
	if err != nil {
		return defaultAge
	}

	return maxAge
}

func GetLogCompress() bool {
	defaultCompress := true
	compress := getEnvConfig("KRYVEA_LOG_COMPRESS", "")

	compressBool, err := strconv.ParseBool(compress)
	if err != nil {
		return defaultCompress
	}

	return compressBool
}

func getEnvConfig(envName, defaultValue string) string {
	value := os.Getenv(envName)
	if value != "" {
		return value
	}

	return defaultValue
}
