package config

import (
	"fmt"
	"net"
	"regexp"
	"slices"

	"github.com/Alexius22/kryvea/internal/cvss"
)

func validateConfig(cfg *Config) error {
	if net.ParseIP(cfg.Web.Address) == nil {
		return fmt.Errorf("invalid address: %s", cfg.Web.Address)
	}

	if cfg.Web.Port < 1 || cfg.Web.Port > 65535 {
		return fmt.Errorf("invalid port: %d", cfg.Web.Port)
	}

	pathRe := regexp.MustCompile(`^/[\S/]*$`)
	if !pathRe.MatchString(cfg.Web.Root) {
		return fmt.Errorf("invalid web root: %s", cfg.Web.Root)
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

	// Validate Customer
	if !cvss.IsValidVersion(cfg.Customer.DefaultCVSSVersion) {
		return fmt.Errorf("invalid default CVSS version: %d", cfg.Customer.DefaultCVSSVersion)
	}

	return nil
}
