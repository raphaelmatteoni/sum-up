package main

import (
	"sumup/pkg/db"
	"sumup/pkg/handlers"
	"sumup/pkg/utils"

	log "github.com/sirupsen/logrus"

	"github.com/labstack/echo/v4"
	_ "github.com/lib/pq"
)

func main() {
	log.SetLevel(log.InfoLevel)

	// Connect to database
	database, err := db.NewDatabase()
	if err != nil {
		log.Fatal(err)
	}
	defer database.Close()

	// Create router
	e := echo.New()

	e.Use(func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			c.Response().Header().Set("Access-Control-Allow-Origin", "*")
			c.Response().Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
			c.Response().Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")

			return next(c)
		}
	})

	e.Use(utils.JsonContentTypeMiddleware)

	// Initialize routes
	handlers.InitRoutes(e, database)

	// Start server
	log.Fatal(e.Start(":8000"))
}
