package config

import (
	"fmt"
	"io"
	"net"
	"os"
	"regexp"
	"slices"

	"github.com/rs/zerolog/log"
	"gopkg.in/yaml.v3"
)

type Config struct {
	Address string `yaml:"address"`
	Port    int    `yaml:"port"`
	WebRoot string `yaml:"web_root"`
	DSN     dsn    `yaml:"dsn"`
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

var Conf Config

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

func validateConfig(cfg *Config) error {
	if net.ParseIP(cfg.Address) == nil {
		return fmt.Errorf("invalid address: %s", cfg.Address)
	}

	if cfg.Port < 1 || cfg.Port > 65535 {
		return fmt.Errorf("invalid port: %d", cfg.Port)
	}

	pathRe := regexp.MustCompile(`^/[\S/]*$`)
	if !pathRe.MatchString(cfg.WebRoot) {
		return fmt.Errorf("invalid web root: %s", cfg.WebRoot)
	}

	// Validate DSN
	if cfg.DSN.Host == "" {
		return fmt.Errorf("invalid DSN host: %s", cfg.DSN.Host)
	}

	if cfg.DSN.Port < 1 || cfg.DSN.Port > 65535 {
		return fmt.Errorf("invalid DSN port: %d", cfg.DSN.Port)
	}

	if cfg.DSN.User == "" {
		return fmt.Errorf("invalid DSN user: %s", cfg.DSN.User)
	}

	if cfg.DSN.Password == "" {
		return fmt.Errorf("invalid DSN password")
	}

	if cfg.DSN.DBName == "" {
		return fmt.Errorf("invalid DSN dbname: %s", cfg.DSN.DBName)
	}

	// https://www.postgresql.org/docs/current/libpq-ssl.html#LIBPQ-SSL-PROTECTION
	if !slices.Contains([]string{"disable", "allow", "prefer", "require", "verify-ca", "verify-full"}, cfg.DSN.SSLMode) {
		return fmt.Errorf("invalid DSN sslmode: %s", cfg.DSN.SSLMode)
	}

	if cfg.DSN.TimeZone == "" {
		return fmt.Errorf("invalid DSN timezone: %s", cfg.DSN.TimeZone)
	}

	return nil
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

	Conf = *cfg
}
