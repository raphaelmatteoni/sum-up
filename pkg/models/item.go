package models

type Item struct {
	ID      int     `json:"id"`
	Name    string  `json:"name"`
	Value   float64 `json:"value"`
	GroupID int     `json:"groupId"`
	BillID  int     `json:"billId"`
}
