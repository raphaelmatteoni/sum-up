package handlers

import (
	"database/sql"
	"log"
	"net/http"
	"regexp"
	"strconv"
	"strings"
	"sumup/pkg/models"
	"time"

	"github.com/labstack/echo/v4"
)

func CreateBillAndItems(database *sql.DB) echo.HandlerFunc {
	return func(c echo.Context) error {
		var reqBody map[string]interface{}
		if err := c.Bind(&reqBody); err != nil {
			return c.JSON(http.StatusBadRequest, map[string]string{"error": "Failed to parse request body"})
		}

		text, ok := reqBody["text"].(string)
		if !ok {
			return c.JSON(http.StatusBadRequest, map[string]string{"error": "Missing 'text' property in request body"})
		}

		text = strings.ReplaceAll(text, "\n", ";")

		itemsText := strings.Split(text, ";")

		items := make([]models.Item, 0)
		for _, itemText := range itemsText {
			itemText = strings.TrimSpace(itemText)
			if itemText == "" {
				continue
			}

			re := regexp.MustCompile(`([a-zA-Z]+)\s*([0-9.]+)`)
			matches := re.FindStringSubmatch(itemText)

			if len(matches) < 3 {
				return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid format in text"})
			}

			name := matches[1]
			valueStr := matches[2]
			value, err := strconv.ParseFloat(valueStr, 64)

			if err != nil {
				return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid value format"})
			}

			items = append(items, models.Item{Name: name, Value: value})
		}

		row := database.QueryRow("INSERT INTO bills (created_at) VALUES ($1) RETURNING id", time.Now())
		var billID int
		err := row.Scan(&billID)

		if err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to get bill ID"})
		}

		log.Printf("Inserted bill with ID: %d", billID)

		// Agora que temos o billID, podemos inserir os Items associados
		for i := range items {
			row := database.QueryRow("INSERT INTO items (name, value, bill_id) VALUES ($1, $2, $3) RETURNING id", items[i].Name, items[i].Value, billID)
			var itemID int
			err := row.Scan(&itemID)
			if err != nil {
				return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to insert item"})
			}

			items[i].ID = itemID
			items[i].BillID = billID
		}

		response := map[string]interface{}{
			"id":        billID,
			"createdAt": time.Now().Format(time.RFC3339),
			"items":     items,
		}

		log.Println(response)

		return c.JSON(http.StatusCreated, response)
	}
}

func GetBill(database *sql.DB) echo.HandlerFunc {
	return func(c echo.Context) error {
		id := c.Param("id")
		log.Println("ID:", id) // Log do ID recebido

		var b models.Bill
		err := database.QueryRow("SELECT * FROM bills WHERE id = $1", id).Scan(&b.ID, &b.CreatedAt)
		if err != nil {
			log.Println("Error fetching bill:", err) // Log do erro
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to fetch bill"})
		}

		// Obter os Items associados ao Bill
		rows, err := database.Query("SELECT * FROM items WHERE bill_id = $1 AND group_id IS NULL", id)
		if err != nil {
			log.Println("Error querying items:", err) // Log do erro
			return err
		}
		defer rows.Close()

		items := []models.Item{}
		for rows.Next() {
			var i models.Item
			if err := rows.Scan(&i.ID, &i.Name, &i.Value, &i.BillID, &i.GroupID); err != nil {
				log.Println("Error scanning item:", err) // Log do erro
				return err
			}
			items = append(items, i)
		}
		if err := rows.Err(); err != nil {
			log.Println("Error iterating over rows:", err) // Log do erro
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

func CreateGroup(database *sql.DB) echo.HandlerFunc {
	return func(c echo.Context) error {
		var reqBody map[string]interface{}
		if err := c.Bind(&reqBody); err != nil {
			return c.JSON(http.StatusBadRequest, map[string]string{"error": "Failed to parse request body"})
		}

		groupName, ok := reqBody["group_name"].(string)
		if !ok {
			return c.JSON(http.StatusBadRequest, map[string]string{"error": "Missing 'group_name' property in request body"})
		}

		billID, ok := reqBody["bill_id"].(string)
		if !ok {
			return c.JSON(http.StatusBadRequest, map[string]string{"error": "Missing 'bill_id' property in request body"})
		}

		row := database.QueryRow("INSERT INTO groups (name, bill_id) VALUES ($1, $2) RETURNING id", groupName, billID)
		var groupID int
		err := row.Scan(&groupID)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to get group ID"})
		}

		log.Printf("Inserted group with ID: %d", groupID)

		response := map[string]interface{}{
			"id":      groupID,
			"name":    groupName,
			"bill_id": billID,
		}

		log.Println(response)

		return c.JSON(http.StatusCreated, response)
	}
}

func UpdateItemGroupID(database *sql.DB) echo.HandlerFunc {
	return func(c echo.Context) error {
		id := c.Param("id")
		log.Println("Item ID:", id) // Log do ID do item

		var updates map[string]interface{}
		if err := c.Bind(&updates); err != nil {
			return c.JSON(http.StatusBadRequest, map[string]string{"error": "Failed to parse request body"})
		}

		groupId, ok := updates["group_id"]
		if !ok {
			return c.JSON(http.StatusBadRequest, map[string]string{"error": "Missing 'group_id' in request body"})
		}

		log.Println("Group ID:", groupId) // Log do Group ID recebido

		_, err := database.Exec("UPDATE items SET group_id = $1 WHERE id = $2", groupId, id)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, nil)
		}

		return c.JSON(http.StatusOK, "Item grouped successfully")
	}
}
