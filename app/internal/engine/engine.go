package engine

import (
	"github.com/Alexius22/kryvea/internal/api"
	"github.com/Alexius22/kryvea/internal/mongo"
	"github.com/Alexius22/kryvea/internal/util"
	"github.com/gofiber/contrib/fiberzerolog"
	"github.com/gofiber/fiber/v2"

	"github.com/bytedance/sonic"
	"github.com/rs/zerolog"
)

type Engine struct {
	addr        string
	rootPath    string
	mongo       *mongo.Driver
	levelWriter *zerolog.LevelWriter
}

func NewEngine(addr, rootPath, mongoURI, adminUser, adminPass string, levelWriter *zerolog.LevelWriter) (*Engine, error) {
	mongo, err := mongo.NewDriver(mongoURI, adminUser, adminPass, levelWriter)
	if err != nil {
		return nil, err
	}

	return &Engine{
		addr:        addr,
		rootPath:    rootPath,
		mongo:       mongo,
		levelWriter: levelWriter,
	}, nil
}

func (e *Engine) Serve() {
	app := fiber.New(fiber.Config{
		DisableStartupMessage: true,
		// TODO: this is a temporary solution to allow large files
		BodyLimit: 10000 * 1024 * 1024,

		JSONEncoder: sonic.Marshal,
		JSONDecoder: sonic.Unmarshal,
	})

	logger := zerolog.New(*e.levelWriter).With().
		Str("source", "fiber-engine").
		Timestamp().Logger()

	app.Use(fiberzerolog.New(fiberzerolog.Config{
		Logger: &logger,
	}))

	api := api.NewDriver(e.mongo, e.levelWriter)

	apiGroup := app.Group(util.JoinUrlPath(e.rootPath, "api"))
	apiGroup.Use(api.SessionMiddleware)
	apiGroup.Use(api.ContentTypeMiddleware)
	{
		apiGroup.Get("/customers", api.GetCustomers)
		apiGroup.Get("/customers/:customer", api.GetCustomer)

		apiGroup.Get("/assessments", api.SearchAssessments)
		apiGroup.Get("/customers/:customer/assessments", api.GetAssessmentsByCustomer)
		apiGroup.Get("/assessments/owned", api.GetOwnedAssessments)
		apiGroup.Get("/assessments/:assessment", api.GetAssessment)
		apiGroup.Post("/assessments", api.AddAssessment)
		apiGroup.Patch("/assessments/:assessment", api.UpdateAssessment)
		apiGroup.Delete("/assessments/:assessment", api.DeleteAssessment)
		apiGroup.Post("/assessments/:assessment/clone", api.CloneAssessment)
		apiGroup.Post("/assessments/:assessment/export", api.ExportAssessment)

		// apiGroup.Get("/targets", api.SearchTargets)
		apiGroup.Get("/customers/:customer/targets", api.GetTargetsByCustomer)
		apiGroup.Get("/targets/:target", api.GetTarget)
		apiGroup.Post("/targets", api.AddTarget)
		apiGroup.Patch("/targets/:target", api.UpdateTarget)
		apiGroup.Delete("/targets/:target", api.DeleteTarget)

		apiGroup.Get("/categories/search", api.SearchCategories)
		apiGroup.Get("/categories", api.GetCategories)
		apiGroup.Get("/categories/:category", api.GetCategory)

		apiGroup.Get("/vulnerabilities/user", api.GetUserVulnerabilities)
		apiGroup.Get("/vulnerabilities/search", api.SearchVulnerabilities)
		apiGroup.Get("/vulnerabilities/:vulnerability", api.GetVulnerability)
		apiGroup.Get("/assessments/:assessment/vulnerabilities", api.GetVulnerabilitiesByAssessment)
		apiGroup.Post("/vulnerabilities", api.AddVulnerability)
		apiGroup.Put("/vulnerabilities/:vulnerability", api.UpdateVulnerability)
		apiGroup.Delete("/vulnerabilities/:vulnerability", api.DeleteVulnerability)
		apiGroup.Post("/assessments/:assessment/upload", api.ImportVulnerbilities)

		apiGroup.Get("/vulnerabilities/:vulnerability/pocs", api.GetPocsByVulnerability)
		apiGroup.Put("/vulnerabilities/:vulnerability/pocs", api.UpsertPocs)
		// apiGroup.Post("/pocs", api.AddPocs)
		// apiGroup.Patch("/pocs/:poc", api.UpdatePoc)
		// apiGroup.Delete("/pocs/:poc", api.DeletePoc)

		apiGroup.Get("/files/:file", api.GetFile)

		apiGroup.Get("/users/me", api.GetMe)
		apiGroup.Patch("/users/me", api.UpdateMe)
		apiGroup.Patch("/users/me/assessments", api.UpdateOwnedAssessment)

		apiGroup.Post("/password/reset", api.ResetPassword)

		apiGroup.Post("/logout", api.Logout)

		// endpoints that don't require authentication
		apiGroup.Post("/login", api.Login)
	}

	adminGroup := apiGroup.Group("/admin")
	adminGroup.Use(api.AdminMiddleware)
	{
		adminGroup.Post("/customers", api.AddCustomer)
		adminGroup.Patch("/customers/:customer", api.UpdateCustomer)
		adminGroup.Delete("/customers/:customer", api.DeleteCustomer)

		adminGroup.Post("/categories", api.AddCategory)
		adminGroup.Post("/categories/upload", api.UploadCategories)
		adminGroup.Patch("/categories/:category", api.UpdateCategory)
		adminGroup.Delete("/categories/:category", api.DeleteCategory)

		adminGroup.Get("/users", api.GetUsers)
		adminGroup.Get("/users/:user", api.GetUser)
		adminGroup.Post("/users", api.AddUser)
		adminGroup.Post("/users/:user/reset-password", api.ResetUserPassword)
		adminGroup.Patch("/users/:user", api.UpdateUser)
		adminGroup.Delete("/users/:user", api.DeleteUser)

		adminGroup.Get("/logs", api.GetLog)
	}

	app.Use(func(c *fiber.Ctx) error {
		return c.Redirect(e.rootPath)
	})

	logger.Info().Msg("Listening for connections on http://" + e.addr)
	if err := app.Listen(e.addr); err != nil {
		logger.Fatal().Err(err).Msg("Failed to start server")
	}
}
