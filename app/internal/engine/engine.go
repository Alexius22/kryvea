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

	api := api.NewDriver(e.mongo)

	apiGroup := app.Group(util.JoinUrlPath(e.rootPath, "api"), middleware.Api)
	{
		apiGroup.Get("/customers", api.GetAllCustomers)
		apiGroup.Post("/customer", api.AddCustomer)

		apiGroup.Get("/assessments/search", api.SearchAssessments)
		apiGroup.Get("/assessments/:customer", api.GetAllAssessments)
		apiGroup.Post("/assessment", api.AddAssessment)

		apiGroup.Get("/targets/search", api.SearchTargets)
		apiGroup.Get("/targets/:customer", api.GetAllTargets)
		apiGroup.Post("/target", api.AddTarget)

		apiGroup.Get("/categories/search", api.SearchCategories)
		apiGroup.Get("/categories", api.GetAllCategories)
		apiGroup.Post("/category", api.AddCategory)

		apiGroup.Get("/vulnerabilities/:assessment/search", api.SearchVulnerabilities)
		apiGroup.Get("/vulnerabilities/:assessment", api.GetAllVulnerabilities)
		apiGroup.Post("/vulnerability", api.AddVulnerability)
	}

	app.Use(func(c *fiber.Ctx) error {
		return c.Redirect(e.rootPath)
	})

	log.Info().Msg("Listening for connections on http://" + e.addr)
	if err := app.Listen(e.addr); err != nil {
		log.Fatal().Err(err).Msg("Failed to start server")
	}
}
