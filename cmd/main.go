package main

import (
	"database/sql"
	"os"
	"sumup/pkg/handlers"

	log "github.com/sirupsen/logrus"

	"github.com/labstack/echo/v4"
	_ "github.com/lib/pq"
)

func main() {
	log.SetLevel(log.InfoLevel)

	// Connect to database
	db, err := sql.Open("postgres", os.Getenv("DATABASE_URL"))
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	// Create the tables if they don't exist
	_, err = db.Exec(`
		CREATE TABLE IF NOT EXISTS bills (
			id SERIAL PRIMARY KEY,
			created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
		)
	`)
	if err != nil {
		log.Fatal(err)
	}

	_, err = db.Exec(`
		CREATE TABLE IF NOT EXISTS items (
			id SERIAL PRIMARY KEY,
			name TEXT NOT NULL,
			value FLOAT NOT NULL,
			bill_id INTEGER REFERENCES bills(id)
		)
	`)
	if err != nil {
		log.Fatal(err)
	}

	// Create router
	e := echo.New()
	e.Use(jsonContentTypeMiddleware)

	e.POST("/bills", handlers.CreateBillAndItems(db))
	e.GET("/bills/:id", handlers.GetBill(db))
	e.DELETE("/bills/:id", handlers.DeleteBill(db))

	// Start server
	log.Fatal(e.Start(":8000"))
}

func jsonContentTypeMiddleware(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		c.Response().Header().Set("Content-Type", "application/json")
		return next(c)
	}
}
