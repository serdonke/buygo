package graph

import (
	"buygo/graph/model"
	"sync"

	"github.com/xjem/t38c"
	"github.com/redis/go-redis/v9"
)
// This file will not be regenerated automatically.
//
// It serves as dependency injection for your app, add any dependencies you require here.

type Subscription struct {
	bb   model.BoundingBox
	feed chan *model.Deal
}

type Resolver struct{
	Tile *t38c.Client

	subsMu sync.RWMutex
	Subs map[string]Subscription

	Redis *redis.Client
}
