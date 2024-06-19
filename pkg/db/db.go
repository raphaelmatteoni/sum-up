package db

import (
	"database/sql"

	_ "github.com/lib/pq"
)

type Database struct {
	*sql.DB
}

func NewDatabase() (*sql.DB, error) {
	database, err := sql.Open("postgres", "host=localhost port=5432 user=postgres password=postgres dbname=sumup sslmode=disable timezone=UTC connect_timeout=5")
	if err != nil {
		return nil, err
	}

	// Initialize tables
	if err := InitTables(database); err != nil {
		return nil, err
	}

	return database, nil
}

func InitTables(database *sql.DB) error {
	// Create the tables if they don't exist
	_, err := database.Exec(`
        CREATE TABLE IF NOT EXISTS bills (
            id SERIAL PRIMARY KEY,
						name TEXT NOT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
    `)
	if err != nil {
		return err
	}

	_, err = database.Exec(`
				CREATE TABLE IF NOT EXISTS groups (
					id SERIAL PRIMARY KEY,
					name TEXT NOT NULL
				)
		`)
	if err != nil {
		return err
	}

	_, err = database.Exec(`
				CREATE TABLE IF NOT EXISTS items (
						id SERIAL PRIMARY KEY,
						name TEXT NOT NULL,
						value FLOAT NOT NULL,
						bill_id INTEGER REFERENCES bills(id),
						group_id INTEGER REFERENCES groups(id)
				)
		`)
	if err != nil {
		return err
	}

	return nil
}
