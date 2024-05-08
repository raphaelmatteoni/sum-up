package handlers

import (
	"database/sql"
	"log"
	"net/http"
	"regexp"
	"strconv"
	"sumup/pkg/models"
	"time"

	"github.com/labstack/echo/v4"
)

func CreateBillAndItems(database *sql.DB) echo.HandlerFunc {
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

		if len(matches) < 3 {
			return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid format in text"})
		}

		name := matches[1]
		valueStr := matches[2]
		value, err := strconv.ParseFloat(valueStr, 64)
		if err != nil {
			return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid value format"})
		}

		// Inserir a Bill e obter o ID
		row := database.QueryRow("INSERT INTO bills (created_at) VALUES ($1) RETURNING id", time.Now())
		var billID int
		err = row.Scan(&billID)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to get bill ID"})
		}

		log.Printf("Inserted bill with ID: %d", billID)

		// Agora que temos o billID, podemos inserir os Items associados
		items := []models.Item{{Name: name, Value: value, BillID: billID}}

		// Inserir os Items associados à Bill
		for _, item := range items {
			result, err := database.Exec("INSERT INTO items (name, value, bill_id) VALUES ($1, $2, $3)", item.Name, item.Value, item.BillID)
			if err != nil {
				return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to insert item"})
			}

			// Verificar se a inserção foi bem-sucedida
			rowsAffected, err := result.RowsAffected()
			log.Printf("Item rows affected: %d", rowsAffected)
			if err != nil {
				return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to check rows affected"})
			}

			if rowsAffected == 0 {
				return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to insert item"})
			}
		}

		// Construir a resposta com o ID da Bill e os Items associados
		response := map[string]interface{}{
			"id":        billID,
			"createdAt": time.Now().Format(time.RFC3339),
			"items":     items,
		}

		return c.JSON(http.StatusCreated, response)
	}
}

func GetBill(database *sql.DB) echo.HandlerFunc {
	return func(c echo.Context) error {
		id := c.Param("id")

		var b models.Bill
		err := database.QueryRow("SELECT * FROM bills WHERE id = $1", id).Scan(&b.ID, &b.CreatedAt)
		if err != nil {
			return c.JSON(http.StatusNotFound, nil)
		}

		// Obter os Items associados ao Bill
		rows, err := database.Query("SELECT * FROM items WHERE bill_id = $1", id)
		if err != nil {
			return err
		}
		defer rows.Close()

		items := []models.Item{}
		for rows.Next() {
			var i models.Item
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

func DeleteBill(database *sql.DB) echo.HandlerFunc {
	return func(c echo.Context) error {
		id := c.Param("id")

		// Primeiro, remover os Items associados ao Bill
		_, err := database.Exec("DELETE FROM items WHERE bill_id = $1", id)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, nil)
		}

		// Em seguida, remover o Bill
		_, err = database.Exec("DELETE FROM bills WHERE id = $1", id)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, nil)
		}

		return c.JSON(http.StatusOK, "Bill and its items deleted")
	}
}
