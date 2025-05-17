package main

import (
	"buygo/graph"
	"log"
	"net/http"
	"os"
	"time"
	"context"
	"encoding/json"

	"buygo/graph/model"
	
	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/handler/extension"
	"github.com/99designs/gqlgen/graphql/handler/lru"
	"github.com/99designs/gqlgen/graphql/handler/transport"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/vektah/gqlparser/v2/ast"

	"github.com/xjem/t38c"
	"github.com/gorilla/websocket"
	"github.com/rs/cors"
	"github.com/redis/go-redis/v9"
)

const defaultPort = "8080"

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = defaultPort
	}
	
	tile, err := t38c.New(t38c.Config{
		Address: "tile38:9851",
		Debug:   true,
	})
	if err != nil {
		log.Fatalf("failed to connect to Tile38: %v", err)
	}

	redisClient := redis.NewClient(&redis.Options{
		Addr: "redis:6379",
	})
	if err := redisClient.Ping(context.Background()).Err(); err != nil {
		log.Printf("warning: Redis not available: %v", err)
	}

	ctx := context.Background()
	if err := hydrateTile38FromRedis(ctx, redisClient, tile); err != nil {
		log.Printf("hydration failed: %v", err)
	}

	srv := handler.New(graph.NewExecutableSchema(graph.Config{
		Resolvers: &graph.Resolver{
			Tile: tile,
			Redis: redisClient,
		}}))

	srv.AddTransport(transport.Options{})
	srv.AddTransport(transport.GET{})
	srv.AddTransport(transport.POST{})
	srv.AddTransport(transport.Websocket{
		KeepAlivePingInterval: 10 * time.Second,
		Upgrader: websocket.Upgrader{
			CheckOrigin: func(r *http.Request) bool {
				return true
			},
		},
	})

	srv.SetQueryCache(lru.New[*ast.QueryDocument](1000))

	srv.Use(extension.Introspection{})
	srv.Use(extension.AutomaticPersistedQuery{
		Cache: lru.New[string](100),
	})

	http.Handle("/", playground.Handler("GraphQL playground", "/query"))
	handlerWithCors := cors.AllowAll().Handler(srv)
	http.Handle("/query", handlerWithCors)

	log.Printf("connect to http://localhost:%s/ for GraphQL playground", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}

func hydrateTile38FromRedis(ctx context.Context, redisClient *redis.Client, tile *t38c.Client) error {
	iter := redisClient.Scan(ctx, 0, "deal:*", 0).Iterator()
	for iter.Next(ctx) {
		key := iter.Val()

		data, err := redisClient.Get(ctx, key).Bytes()
		if err != nil {
			log.Printf("failed to read %s from Redis: %v", key, err)
			continue
		}

		var deal model.Deal
		if err := json.Unmarshal(data, &deal); err != nil {
			log.Printf("failed to unmarshal %s: %v", key, err)
			continue
		}

		err = tile.Keys.Set("deals", deal.ID).
			Point(deal.Location.Latitude, deal.Location.Longitude).
			Field("created_at", float64(deal.CreatedAt.Unix())).
			Do(ctx)
		if err != nil {
			log.Printf("failed to rehydrate deal %s into Tile38: %v", deal.ID, err)
		}
	}
	if err := iter.Err(); err != nil {
		return err
	}
	log.Println("✅ Tile38 hydration complete.")
	return nil
}
