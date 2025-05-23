// Code generated by github.com/99designs/gqlgen, DO NOT EDIT.

package model

import (
	"time"
)

type BoundingBox struct {
	MinLatitude  float64 `json:"minLatitude"`
	MaxLatitude  float64 `json:"maxLatitude"`
	MinLongitude float64 `json:"minLongitude"`
	MaxLongitude float64 `json:"maxLongitude"`
}

type Deal struct {
	ID                 string     `json:"id"`
	Title              string     `json:"title"`
	Description        string     `json:"description"`
	VendorID           string     `json:"vendorId"`
	Price              float64    `json:"price"`
	OriginalPrice      *float64   `json:"originalPrice,omitempty"`
	DiscountPercentage *float64   `json:"discountPercentage,omitempty"`
	Location           *GeoPoint  `json:"location"`
	ExpiresAt          *time.Time `json:"expiresAt,omitempty"`
	CreatedAt          time.Time  `json:"createdAt"`
}

type DealInput struct {
	Title         string         `json:"title"`
	Description   string         `json:"description"`
	VendorID      string         `json:"vendorId"`
	Price         float64        `json:"price"`
	OriginalPrice *float64       `json:"originalPrice,omitempty"`
	Location      *GeoPointInput `json:"location"`
	ExpiresAt     *time.Time     `json:"expiresAt,omitempty"`
}

type GeoPoint struct {
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
}

type GeoPointInput struct {
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
}

type Mutation struct {
}

type Query struct {
}

type Subscription struct {
}
