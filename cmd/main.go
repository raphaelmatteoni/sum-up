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
	e.Use(utils.JsonContentTypeMiddleware)

	// Initialize routes
	handlers.InitRoutes(e, database)

	// Start server
	log.Fatal(e.Start(":8000"))
}
