package main

import (
	"log"

	"github.com/Alexius22/kryvea/internal/config"
	"github.com/Alexius22/kryvea/internal/engine"
)

func main() {
	engine, err := engine.NewEngine(
		config.GetListeningAddr(),
		config.GetRootPath(),
		config.GetMongoURI(),
		config.GetAdminUser(),
		config.GetAdminPass(),
	)
	if err != nil {
		log.Fatal("Unable to create engine:", err)
	}

	engine.Serve()
}
