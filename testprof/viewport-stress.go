package main

import (
	"bufio"
	"strings"
	"strconv"
	"sync"
	"context"
	"fmt"
	"math/rand"
	"os"
	"time"

	"nhooyr.io/websocket"
	"nhooyr.io/websocket/wsjson"
)

const (
	serverURL = "wss://backend.serdonke.xyz/query"
	numSubs   = 2000
)

type GQLMessage struct {
	Type    string      `json:"type"`
	ID      string      `json:"id,omitempty"`
	Payload interface{} `json:"payload,omitempty"`
}

func randomBoundingBox() map[string]float64 {
	lat := 13.0827 + (rand.Float64()-0.5)*0.1
	lng := 80.2707 + (rand.Float64()-0.5)*0.1
	return map[string]float64{
		"minLatitude":  lat,
		"maxLatitude":  lat + 0.02,
		"minLongitude": lng,
		"maxLongitude": lng + 0.02,
	}
}

func main() {
	rand.Seed(time.Now().UnixNano())
	reader := bufio.NewReader(os.Stdin)

	fmt.Print("Enter number of simulated viewport connections: ")
	numInput, _ := reader.ReadString('\n')
	numInput = strings.TrimSpace(numInput)
	numConnections, err := strconv.Atoi(numInput)
	if err != nil || numConnections <= 0 {
		fmt.Println("Invalid number. Exiting.")
		return
	}

	statusTable := make([]string, numConnections)
	var mu sync.Mutex

	for i := 0; i < numConnections; i++ {
		go func(id int) {
			for {
				ctx, cancel := context.WithTimeout(context.Background(), 30*time.Minute)
				defer cancel()

				conn, _, err := websocket.Dial(ctx, serverURL, nil)
				if err != nil {
					mu.Lock()
					statusTable[id] = "disconnected"
					mu.Unlock()
					fmt.Printf("[%d] connection failed: %v\n", id, err)
					time.Sleep(3 * time.Second)
					continue
				}
				defer conn.Close(websocket.StatusNormalClosure, "")
				wsjson.Write(ctx, conn, GQLMessage{Type: "connection_init"})

				bbox := randomBoundingBox()
				writeSub(ctx, conn, id, bbox)

				mu.Lock()
				statusTable[id] = "connected"
				mu.Unlock()

				ticker := time.NewTicker(time.Duration(5+rand.Intn(5)) * time.Second)
				defer ticker.Stop()

				for {
					select {
					case <-ticker.C:
						bbox = randomBoundingBox()
						writeSub(ctx, conn, id, bbox)
						mu.Lock()
						statusTable[id] = fmt.Sprintf("bbox updated")
						mu.Unlock()
					case <-ctx.Done():
						return
					}
				}
			}
		}(i)
	}

	// Display status table every 10s
	for {
		time.Sleep(10 * time.Second)
		fmt.Println("--- Connection Status ---")
		mu.Lock()
		for i, status := range statusTable {
			fmt.Printf("[%03d] %s\n", i, status)
		}
		mu.Unlock()
		fmt.Println()
	}
}

func writeSub(ctx context.Context, conn *websocket.Conn, id int, bbox map[string]float64) {
	msg := GQLMessage{
		Type: "start",
		ID:   fmt.Sprintf("sub-%d", id),
		Payload: map[string]interface{}{
			"query": `
				subscription($boundingBox: BoundingBox!) {
					dealCreatedInViewport(boundingBox: $boundingBox) {
						id title location { latitude longitude }
					}
				}`,
			"variables": map[string]interface{}{
				"boundingBox": bbox,
			},
		},
	}
	wsjson.Write(ctx, conn, msg)
}
