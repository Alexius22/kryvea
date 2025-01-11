package main

import (
	"github.com/rs/zerolog/log"

	"github.com/Alexius22/kryvea/internal/db"
	"github.com/Alexius22/kryvea/internal/engine"
)

func main() {
	customer := db.Customer{
		ID:   "1",
		Name: "test",
		Lang: "en",
	}
	log.Print(customer)
	engine.Serve()
}
