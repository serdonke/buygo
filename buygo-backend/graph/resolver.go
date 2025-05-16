package graph

import (
	"buygo/graph/model"
	"sync"

	"github.com/xjem/t38c"
)
// This file will not be regenerated automatically.
//
// It serves as dependency injection for your app, add any dependencies you require here.

type Subscription struct {
	bb   model.BoundingBox
	feed chan *model.Deal
}

type Resolver struct{
	Deals []*model.Deal
	mu sync.RWMutex
	
	Tile *t38c.Client

	subsMu sync.RWMutex
	Subs map[string]Subscription
}
