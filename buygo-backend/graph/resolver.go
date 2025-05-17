package graph

import (
	"github.com/xjem/t38c"
	"github.com/redis/go-redis/v9"
)
// This file will not be regenerated automatically.
//
// It serves as dependency injection for your app, add any dependencies you require here.

type Resolver struct{
	Tile *t38c.Client
	Redis *redis.Client
}
