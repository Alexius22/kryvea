package engine

import (
	"fmt"

	"github.com/Alexius22/kryvea/internal/api"
	"github.com/Alexius22/kryvea/internal/config"
	"github.com/Alexius22/kryvea/internal/middleware"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/rs/zerolog/log"
)

// Serve - Serve application
func Serve() {
	app := fiber.New(fiber.Config{
		DisableStartupMessage: true,
	})

	app.Use(logger.New(logger.Config{
		Format:     "${time} ${status} - ${latency} ${method} ${path}\n",
		TimeFormat: "02/01/2006 15:04:05",
		TimeZone:   "CET",
	}))

	webConfig := config.GetWeb()
	rootPath := webConfig.Root

	app.Get(rootPath, func(c *fiber.Ctx) error {
		return c.SendString("Kryvea API")
	})

	apiGroup := app.Group(config.JoinUrlPath(rootPath, "api"), middleware.Api)
	{
		apiGroup.Get("/customers", api.GetAllCustomers)
		apiGroup.Post("/add-customer", api.AddCustomer)

		// apiGroup.Post("/assessments", api.GetAllAssessments)
		// apiGroup.Post("/add-assessment", api.AddAssessment)
		// apiGroup.Post("/search-assessment", api.SearchAssessment)

		// apiGroup.Post("/targets", api.GetAllTargets)
		// apiGroup.Post("/add-target", api.AddTarget)
		// apiGroup.Post("/search-target", api.SearchTarget)

		// apiGroup.Post("/vulnerabilities", api.GetAllVulnerabilities)
		// apiGroup.Post("/add-vulnerability", api.AddVulnerability)

		// apiGroup.Get("/categories", api.GetAllCategories)
		// apiGroup.Post("/add-category", api.AddCategory)
	}

	app.Use(func(c *fiber.Ctx) error {
		return c.Redirect(rootPath)
	})

	address := fmt.Sprintf("%s:%d", webConfig.Address, webConfig.Port)
	log.Info().Msg("Listening for connections on http://" + address)
	if err := app.Listen(address); err != nil {
		log.Fatal().Err(err).Msg("Failed to start server")
	}
}
