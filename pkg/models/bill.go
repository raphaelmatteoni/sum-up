package models

import "time"

type Bill struct {
	ID        int       `json:"id"`
	CreatedAt time.Time `json:"createdAt"`
	Items     []Item    `json:"items"`
}
