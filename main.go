package main

import (
	"database/sql"
	"net/http"
	"os"
	"regexp"
	"strconv"
	"time"

	log "github.com/sirupsen/logrus"

	"github.com/labstack/echo/v4"
	_ "github.com/lib/pq"
)

type Bill struct {
	ID        int       `json:"id"`
	CreatedAt time.Time `json:"createdAt"`
	Items     []Item    `json:"items"`
}

type Item struct {
	ID     int     `json:"id"`
	Name   string  `json:"name"`
	Value  float64 `json:"value"`
	BillID int     `json:"billId"`
}

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

	e.POST("/bills", createBillAndItems(db))
	e.GET("/bills/:id", getBill(db))
	e.DELETE("/bills/:id", deleteBill(db))

	// Start server
	log.Fatal(e.Start(":8000"))
}

func jsonContentTypeMiddleware(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		c.Response().Header().Set("Content-Type", "application/json")
		return next(c)
	}
}

func createBillAndItems(db *sql.DB) echo.HandlerFunc {
	return func(c echo.Context) error {
		// Tentar parsear o corpo da solicitação como JSON
		var reqBody map[string]interface{}
		if err := c.Bind(&reqBody); err != nil {
			return c.JSON(http.StatusBadRequest, map[string]string{"error": "Failed to parse request body"})
		}

		// Verificar se a propriedade "text" existe no corpo da solicitação
		text, ok := reqBody["text"].(string)
		if !ok {
			return c.JSON(http.StatusBadRequest, map[string]string{"error": "Missing 'text' property in request body"})
		}

		// Expressão regular para extrair nome e valor
		re := regexp.MustCompile(`([a-zA-Z]+)\s*([0-9.]+)`)
		matches := re.FindStringSubmatch(text)
		log.Print(matches)

		if len(matches) < 3 {
			return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid format in text"})
		}

		name := matches[1]
		log.Print(name)
		valueStr := matches[2]
		log.Print(valueStr)
		value, err := strconv.ParseFloat(valueStr, 64)
		log.Print(value)
		if err != nil {
			return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid value format"})
		}

		// Aqui você pode criar a Bill e os Items conforme necessário
		// Exemplo:
		bill := Bill{CreatedAt: time.Now()}
		items := []Item{{Name: name, Value: value, BillID: bill.ID}}

		// Inserir a Bill
		result, err := db.Exec("INSERT INTO bills (created_at) VALUES ($1) RETURNING id", bill.CreatedAt)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to insert bill"})
		}

		billID, err := result.LastInsertId()
		if err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to get bill ID"})
		}

		// Inserir os Items associados à Bill
		for _, item := range items {
			result, err = db.Exec("INSERT INTO items (name, value, bill_id) VALUES ($1, $2, $3)", item.Name, item.Value, billID)
			if err != nil {
				return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to insert item"})
			}

			// Verificar se a inserção foi bem-sucedida
			rowsAffected, err := result.RowsAffected()
			if err != nil {
				return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to check rows affected"})
			}

			if rowsAffected == 0 {
				return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to insert item"})
			}
		}

		return c.JSON(http.StatusCreated, bill)
	}
}

func getBill(db *sql.DB) echo.HandlerFunc {
	return func(c echo.Context) error {
		id := c.Param("id")

		var b Bill
		err := db.QueryRow("SELECT * FROM bills WHERE id = $1", id).Scan(&b.ID, &b.CreatedAt)
		if err != nil {
			return c.JSON(http.StatusNotFound, nil)
		}

		// Obter os Items associados ao Bill
		rows, err := db.Query("SELECT * FROM items WHERE bill_id = $1", id)
		if err != nil {
			return err
		}
		defer rows.Close()

		items := []Item{}
		for rows.Next() {
			var i Item
			if err := rows.Scan(&i.ID, &i.Name, &i.Value, &i.BillID); err != nil {
				return err
			}
			items = append(items, i)
		}
		if err := rows.Err(); err != nil {
			return err
		}

		b.Items = items

		return c.JSON(http.StatusOK, b)
	}
}

func deleteBill(db *sql.DB) echo.HandlerFunc {
	return func(c echo.Context) error {
		id := c.Param("id")

		// Primeiro, remover os Items associados ao Bill
		_, err := db.Exec("DELETE FROM items WHERE bill_id = $1", id)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, nil)
		}

		// Em seguida, remover o Bill
		_, err = db.Exec("DELETE FROM bills WHERE id = $1", id)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, nil)
		}

		return c.JSON(http.StatusOK, "Bill and its items deleted")
	}
}
