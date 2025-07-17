package main

import (
	"github.com/Alexius22/kryvea/internal/config"
	"github.com/Alexius22/kryvea/internal/engine"
	"github.com/Alexius22/kryvea/internal/log"
)

func main() {
	levelWriter := log.NewLogger(
		config.GetLogFilePath(),
		config.GetErrorLogFilePath(),
		config.GetDebugLogFilePath(),
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
		// fmt.Println("Unable to create engine:", err)
		// logger.Logger.Error().Err(err).Msg("Unable to create engine")
		return
	}

	// logger.Logger.Info().Msgf("Starting Kryvea on %s", config.GetListeningAddr())

	engine.Serve()
}
