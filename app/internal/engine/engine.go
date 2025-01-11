package engine

import (
	"fmt"
	"log"

	"github.com/Alexius22/kryvea/internal/config"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/logger"
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

	// rootPath := config.GetRootPath()

	// app.Get(config.JoinUrlPath(rootPath, "favicon.ico"), func(c *fiber.Ctx) error {
	// 	data, err := static.StaticFS.ReadFile("public/favicon.ico")
	// 	if err != nil {
	// 		return c.SendStatus(http.StatusNotFound)
	// 	}

	// 	c.Set("Content-type", "image/x-icon")
	// 	return c.Send(data)
	// })

	// app.Get(config.JoinUrlPath(rootPath, "roboto-regular.ttf"), func(c *fiber.Ctx) error {
	// 	data, err := static.StaticFS.ReadFile("public/font/roboto-regular.ttf")
	// 	if err != nil {
	// 		return c.SendStatus(http.StatusNotFound)
	// 	}

	// 	c.Set("Content-type", "font/ttf")
	// 	return c.Send(data)
	// })

	// app.Get(config.JoinUrlPath(rootPath, "style.css"), func(c *fiber.Ctx) error {
	// 	status, err := e.Routine.GetStatus()
	// 	if err != nil {
	// 		c.Status(http.StatusInternalServerError)
	// 		return c.SendString(err.Error())
	// 	}

	// 	tmpl, err := htmltemplate.New("").Parse(status.CSSData)
	// 	if err != nil {
	// 		return c.SendStatus(http.StatusInternalServerError)
	// 	}

	// 	c.Set("Content-type", "text/css")
	// 	return tmpl.Execute(c, fiber.Map{
	// 		"Background": status.Theme.Background,
	// 		"Foreground": status.Theme.Foreground,
	// 		"FontURL":    config.JoinUrlPath(rootPath, "roboto-regular.ttf"),
	// 	})
	// })

	rootPath := "/"

	app.Get(rootPath, func(c *fiber.Ctx) error {
		return c.SendString("Hello, World!")
	})

	app.Use(func(c *fiber.Ctx) error {
		return c.Redirect(rootPath)
	})

	address := fmt.Sprintf("%s:%s", config.Conf.Address, config.Conf.Port)
	log.Println("Listening for connections on", address)
	if err := app.Listen(address); err != nil {
		log.Fatal(err)
	}
}
