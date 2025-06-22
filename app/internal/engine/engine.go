package engine

import (
	"github.com/Alexius22/kryvea/internal/api"
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

func NewEngine(addr, rootPath, mongoURI, adminUser, adminPass string) (*Engine, error) {
	mongo, err := mongo.NewDriver(mongoURI, adminUser, adminPass)
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
		// TODO: this is a temporary solution to allow large files
		BodyLimit: 50 * 1024 * 1024,
	})

	app.Use(logger.New(logger.Config{
		Format:     "${time} ${status} - ${latency} ${method} ${path}\n",
		TimeFormat: "02/01/2006 15:04:05",
		TimeZone:   "CET",
	}))

	api := api.NewDriver(e.mongo)

	apiGroup := app.Group(util.JoinUrlPath(e.rootPath, "api"))
	apiGroup.Use(api.SessionMiddleware)
	apiGroup.Use(api.ContentTypeMiddleware)
	{
		apiGroup.Get("/customers", api.GetCustomers)
		apiGroup.Post("/customers", api.AddCustomer)
		apiGroup.Patch("/customers/:customer", api.UpdateCustomer)
		apiGroup.Delete("/customers/:customer", api.DeleteCustomer)

		apiGroup.Get("/assessments/search", api.SearchAssessments)
		apiGroup.Get("/customers/:customer/assessments", api.GetAssessmentsByCustomer)
		apiGroup.Post("/customers/:customer/assessments", api.AddAssessment)
		apiGroup.Patch("/customers/:customer/assessments/:assessment", api.UpdateAssessment)
		apiGroup.Delete("/customers/:customer/assessments/:assessment", api.DeleteAssessment)
		apiGroup.Post("/customers/:customer/assessments/:assessment/clone", api.CloneAssessment)
		apiGroup.Post("/customers/:customer/assessments/:assessment/export", api.ExportAssessment)

		apiGroup.Get("/customers/:customer/targets/search", api.SearchTargets)
		apiGroup.Get("/customers/:customer/targets", api.GetTargetsByCustomer)
		apiGroup.Get("/customers/:customer/targets/:target", api.GetTarget)
		apiGroup.Post("/customers/:customer/targets", api.AddTarget)
		apiGroup.Patch("/customers/:customer/targets/:target", api.UpdateTarget)
		apiGroup.Delete("/customers/:customer/targets/:target", api.DeleteTarget)

		apiGroup.Get("/categories/search", api.SearchCategories)
		apiGroup.Get("/categories", api.GetCategories)
		apiGroup.Post("/categories", api.AddCategory)
		apiGroup.Post("/categories/upload/bulk", api.UploadCategories)
		apiGroup.Patch("/categories/:category", api.UpdateCategory)
		apiGroup.Delete("/categories/:category", api.DeleteCategory)

		apiGroup.Get("/vulnerabilities/user", api.GetUserVulnerabilities)
		apiGroup.Get("/vulnerabilities/search", api.SearchVulnerabilities)
		apiGroup.Get("/assessments/:assessment/vulnerabilities", api.GetVulnerabilitiesByAssessment)
		apiGroup.Post("/assessments/:assessment/vulnerabilities", api.AddVulnerability)
		apiGroup.Patch("/assessments/:assessment/vulnerabilities/:vulnerability", api.UpdateVulnerability)
		apiGroup.Delete("/assessments/:assessment/vulnerabilities/:vulnerability", api.DeleteVulnerability)

		apiGroup.Get("/vulnerabilities/:vulnerability/pocs", api.GetPocsByVulnerability)
		apiGroup.Post("/vulnerabilities/:vulnerability/pocs", api.AddPoc)
		apiGroup.Patch("/vulnerabilities/:vulnerability/pocs/:poc", api.UpdatePoc)
		apiGroup.Delete("/vulnerabilities/:vulnerability/pocs/:poc", api.DeletePoc)

		apiGroup.Post("/assessments/:assessment/upload/nessus", api.UploadNessus)

		apiGroup.Get("/users", api.GetUsers)
		apiGroup.Get("/users/:user", api.GetUser)
		apiGroup.Post("/users", api.AddUser)
		apiGroup.Patch("/users/me", api.UpdateMe)
		apiGroup.Patch("/users/:user", api.UpdateUser)
		apiGroup.Delete("/users/:user", api.DeleteUser)

		apiGroup.Post("/logout", api.Logout)

		// endpoints that don't require authentication
		apiGroup.Post("/login", api.Login)
		apiGroup.Post("/password/reset", api.ResetPassword)
	}

	app.Use(func(c *fiber.Ctx) error {
		return c.Redirect(e.rootPath)
	})

	log.Info().Msg("Listening for connections on http://" + e.addr)
	if err := app.Listen(e.addr); err != nil {
		log.Fatal().Err(err).Msg("Failed to start server")
	}
}
