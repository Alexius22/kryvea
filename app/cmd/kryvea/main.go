package main

import (
	"github.com/Alexius22/kryvea/internal/config"
	"github.com/Alexius22/kryvea/internal/engine"
	"github.com/Alexius22/kryvea/internal/i18n"
	"github.com/Alexius22/kryvea/internal/log"
)

func main() {
	err := i18n.InitI18n(config.GetLocalesPath())
	if err != nil {
		return
	}

	levelWriter := log.NewLevelWriter(
		config.GetLogDirectory(),
		config.GetLogMaxSizeMB(),
		config.GetLogMaxBackups(),
		config.GetLogMaxAgeDays(),
		config.GetLogCompress(),
	)

	engine, err := engine.NewEngine(
		config.GetListeningAddr(),
		config.GetRootPath(),
		config.GetMongoURI(),
		config.GetAdminUser(),
		config.GetAdminPass(),
		levelWriter,
	)
	if err != nil {
		return
	}

	engine.Serve()
}
