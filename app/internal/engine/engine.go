package engine

import (
	"github.com/Alexius22/kryvea/internal/api"
	"github.com/Alexius22/kryvea/internal/middleware"
	"github.com/Alexius22/kryvea/internal/mongo"
	"github.com/Alexius22/kryvea/internal/util"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/rs/zerolog/log"
)

type Engine struct {
	addr     string
	rootPath string
	mongo    *mongo.Driver
}

func NewEngine(addr, rootPath, mongoURI string) (*Engine, error) {
	mongo, err := mongo.NewDriver(mongoURI)
	if err != nil {
		return nil, err
	}

	return &Engine{
		addr:     addr,
		rootPath: rootPath,
		mongo:    mongo,
	}, nil
}

func (e *Engine) Serve() {
	app := fiber.New(fiber.Config{
		DisableStartupMessage: true,
	})

	app.Use(logger.New(logger.Config{
		Format:     "${time} ${status} - ${latency} ${method} ${path}\n",
		TimeFormat: "02/01/2006 15:04:05",
		TimeZone:   "CET",
	}))

	apiGroup := app.Group(util.JoinUrlPath(e.rootPath, "api"), middleware.Api)
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
		return c.Redirect(e.rootPath)
	})

	log.Info().Msg("Listening for connections on http://" + e.addr)
	if err := app.Listen(e.addr); err != nil {
		log.Fatal().Err(err).Msg("Failed to start server")
	}
}
