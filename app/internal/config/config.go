package config

import (
	"io"
	"os"

	"github.com/rs/zerolog/log"
	"gopkg.in/yaml.v3"
)

type Config struct {
	Web      web      `yaml:"web"`
	DSN      dsn      `yaml:"dsn"`
	MongoURI string   `yaml:"mongo_uri"`
	Customer customer `yaml:"customer"`
}

type web struct {
	Address string `yaml:"address"`
	Port    int    `yaml:"port"`
	Root    string `yaml:"root"`
}

type dsn struct {
	Host     string `yaml:"host"`
	User     string `yaml:"user"`
	Password string `yaml:"password"`
	DBName   string `yaml:"dbname"`
	Port     int    `yaml:"port"`
	SSLMode  string `yaml:"sslmode"`
	TimeZone string `yaml:"timezone"`
}

type customer struct {
	DefaultCVSSVersion int `yaml:"default_cvss_version"`
}

var conf Config

func loadConfig(cfgData []byte) (*Config, error) {
	cfg, err := Unmarshal(cfgData)
	if err != nil {
		return nil, err
	}

	if err := validateConfig(cfg); err != nil {
		return nil, err
	}

	return cfg, nil
}

func Unmarshal(configBytes []byte) (*Config, error) {
	config := &Config{}
	err := yaml.Unmarshal(configBytes, config)
	if err == nil {
		return config, nil
	}
	return nil, err
}

func init() {
	cfgFilePath, err := GetConfigPath(os.Args)
	if err != nil {
		log.Fatal().Err(err).Msg("No configuration file provided")
	}

	cfgFile, err := os.Open(cfgFilePath)
	if err != nil {
		log.Fatal().Err(err).Msg("Failed to open configuration file")
	}
	defer cfgFile.Close()

	fileData, _ := io.ReadAll(cfgFile)

	cfg, err := loadConfig(fileData)
	if err != nil {
		log.Fatal().Err(err).Msg("Failed to unmarshal configuration file")
	}

	conf = *cfg
}
