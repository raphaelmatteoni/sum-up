package models

type Group struct {
	ID     int    `json:"id"`
	Name   string `json:"name"`
	BillID int    `json:"billId"`
	Items  []Item `json:"items"`
}
