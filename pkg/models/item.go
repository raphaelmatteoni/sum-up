package models

type Item struct {
	ID     int     `json:"id"`
	Name   string  `json:"name"`
	Value  float64 `json:"value"`
	BillID int     `json:"billId"`
}
