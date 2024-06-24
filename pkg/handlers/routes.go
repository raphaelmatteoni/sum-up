package handlers

import (
	"database/sql"

	"github.com/labstack/echo/v4"
)

func InitRoutes(e *echo.Echo, database *sql.DB) {
	e.POST("/bills", CreateBillAndItems(database))
	e.GET("/bills/:id", GetBill(database))
	e.DELETE("/bills/:id", DeleteBill(database))
	e.POST("/groups", CreateGroup(database))
}
