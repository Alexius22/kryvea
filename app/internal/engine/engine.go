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
	})

	app.Use(logger.New(logger.Config{
		Format:     "${time} ${status} - ${latency} ${method} ${path}\n",
		TimeFormat: "02/01/2006 15:04:05",
		TimeZone:   "CET",
	}))

	api := api.NewDriver(e.mongo)

	apiGroup := app.Group(util.JoinUrlPath(e.rootPath, "api"))

	nonAuthenticatedApi := apiGroup.Use(api.ContentTypeMiddleware)
	{
		nonAuthenticatedApi.Post("/login", api.Login)
		nonAuthenticatedApi.Post("/password/reset", api.ResetPassword)
	}

	// TODO: It would be preferable to first handle user authentication
	// and then check if the content type is correct
	// Right now, the content type is checked first
	authenticatedApi := apiGroup.Use(api.SessionMiddleware)
	{
		authenticatedApi.Get("/customers", api.GetCustomers)
		authenticatedApi.Post("/customers", api.AddCustomer)
		authenticatedApi.Patch("/customers/:customer", api.UpdateCustomer)
		authenticatedApi.Delete("/customers/:customer", api.DeleteCustomer)

		authenticatedApi.Get("/assessments/search", api.SearchAssessments)
		authenticatedApi.Get("/customers/:customer/assessments", api.GetAssessmentsByCustomer)
		authenticatedApi.Post("/customers/:customer/assessments", api.AddAssessment)
		authenticatedApi.Patch("/customers/:customer/assessments/:assessment", api.UpdateAssessment)
		authenticatedApi.Delete("/customers/:customer/assessments/:assessment", api.DeleteAssessment)
		authenticatedApi.Post("/customers/:customer/assessments/:assessment/clone", api.CloneAssessment)
		authenticatedApi.Post("/assessments/:assessment/export", api.ExportAssessment)

		authenticatedApi.Get("/customers/:customer/targets/search", api.SearchTargets)
		authenticatedApi.Get("/customers/:customer/targets", api.GetTargetsByCustomer)
		authenticatedApi.Get("/customers/:customer/targets/:target", api.GetTarget)
		authenticatedApi.Post("/customers/:customer/targets", api.AddTarget)
		authenticatedApi.Patch("/customers/:customer/targets/:target", api.UpdateTarget)
		authenticatedApi.Delete("/customers/:customer/targets/:target", api.DeleteTarget)

		authenticatedApi.Get("/categories/search", api.SearchCategories)
		authenticatedApi.Get("/categories", api.GetCategories)
		authenticatedApi.Post("/categories", api.AddCategory)
		authenticatedApi.Patch("/categories/:category", api.UpdateCategory)
		authenticatedApi.Delete("/categories/:category", api.DeleteCategory)

		authenticatedApi.Get("/vulnerabilities/search", api.SearchVulnerabilities)
		authenticatedApi.Get("/assessments/:assessment/vulnerabilities", api.GetVulnerabilitiesByAssessment)
		authenticatedApi.Post("/assessments/:assessment/vulnerabilities", api.AddVulnerability)
		authenticatedApi.Patch("/assessments/:assessment/vulnerabilities/:vulnerability", api.UpdateVulnerability)
		authenticatedApi.Delete("/assessments/:assessment/vulnerabilities/:vulnerability", api.DeleteVulnerability)

		authenticatedApi.Get("/vulnerabilities/:vulnerability/pocs", api.GetPocsByVulnerability)
		authenticatedApi.Post("/vulnerabilities/:vulnerability/pocs", api.AddPoc)
		authenticatedApi.Patch("/vulnerabilities/:vulnerability/pocs/:poc", api.UpdatePoc)
		authenticatedApi.Delete("/vulnerabilities/:vulnerability/pocs/:poc", api.DeletePoc)

		authenticatedApi.Get("/users", api.GetUsers)
		authenticatedApi.Get("/users/:user", api.GetUser)
		authenticatedApi.Post("/users", api.AddUser)
		authenticatedApi.Patch("/users/me", api.UpdateMe)
		authenticatedApi.Patch("/users/:user", api.UpdateUser)
		authenticatedApi.Delete("/users/:user", api.DeleteUser)

		authenticatedApi.Post("/logout", api.Logout)
	}

	app.Use(func(c *fiber.Ctx) error {
		return c.Redirect(e.rootPath)
	})

	log.Info().Msg("Listening for connections on http://" + e.addr)
	if err := app.Listen(e.addr); err != nil {
		log.Fatal().Err(err).Msg("Failed to start server")
	}
}
