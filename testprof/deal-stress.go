package main

import (
	"bufio"
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"math/rand"
	"net/http"
	"os"
	"strconv"
	"strings"
	"sync"
	"time"
)

const url = "https://backend.serdonke.xyz/query"

type GQLRequest struct {
	Query         string                 `json:"query"`
	OperationName string                 `json:"operationName"`
	Variables     map[string]interface{} `json:"variables"`
}

func main() {
	reader := bufio.NewReader(os.Stdin)

	for {
		// Ask for city
		fmt.Print("Enter a city to bombard with spicy deals: ")
		cityInput, _ := reader.ReadString('\n')
		city := strings.TrimSpace(cityInput)

		// Ask for radius
		fmt.Print("Enter radius (in km) around the city: ")
		radiusInput, _ := reader.ReadString('\n')
		radiusStr := strings.TrimSpace(radiusInput)
		radiusKm, err := strconv.ParseFloat(radiusStr, 64)
		if err != nil || radiusKm <= 0 {
			fmt.Println("Invalid radius. Try again.")
			continue
		}

		// Ask for number of deals
		fmt.Print("How many deals to launch? ")
		numInput, _ := reader.ReadString('\n')
		numStr := strings.TrimSpace(numInput)
		numDeals, err := strconv.Atoi(numStr)
		if err != nil || numDeals <= 0 {
			fmt.Println("Invalid number of deals. Try again.")
			continue
		}

		// Resolve city
		lat, lng, err := resolveCityToCoords(city)
		if err != nil {
			fmt.Printf("Could not resolve city: %v\n", err)
			continue
		}

		fmt.Printf("Resolved %s to (%.4f, %.4f)\n", city, lat, lng)
		fmt.Printf("Radius: %.2f km | Deals: %d\n", radiusKm, numDeals)
		pepperDeals(city, lat, lng, radiusKm, numDeals)

	}
}

func resolveCityToCoords(city string) (float64, float64, error) {
	queryURL := fmt.Sprintf("https://nominatim.openstreetmap.org/search?q=%s&format=json&limit=1", city)

	req, _ := http.NewRequest("GET", queryURL, nil)
	req.Header.Set("User-Agent", "DealStressCLI/1.0")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return 0, 0, err
	}
	defer resp.Body.Close()

	var results []map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&results); err != nil || len(results) == 0 {
		return 0, 0, fmt.Errorf("no results for city: %s", city)
	}

	lat, _ := strconv.ParseFloat(results[0]["lat"].(string), 64)
	lng, _ := strconv.ParseFloat(results[0]["lon"].(string), 64)
	return lat, lng, nil
}

func randomNearby(lat, lng, radiusKm float64) (float64, float64) {
	degreeOffset := radiusKm / 111.0
	offsetLat := (rand.Float64()*2 - 1) * degreeOffset
	offsetLng := (rand.Float64()*2 - 1) * degreeOffset
	return lat + offsetLat, lng + offsetLng
}

func pepperDeals(city string, baseLat, baseLng, radiusKm float64, numDeals int) {
	rand.Seed(time.Now().UnixNano())
	client := http.Client{Timeout: 10 * time.Second}
	var wg sync.WaitGroup

	mutation := `mutation createDeal($input: DealInput!) { createDeal(input: $input) { id } }`

	for i := 0; i < numDeals; i++ {
		wg.Add(1)

		lat, lng := randomNearby(baseLat, baseLng, radiusKm)

		input := map[string]interface{}{
			"title":         fmt.Sprintf("%s Deal %03d", city, i),
			"description":   "Stress test deal explosion",
			"vendorId":      fmt.Sprintf("stressbot-%d", i%10),
			"price":         1.0 + float64(i%20),
			"originalPrice": 10.0,
			"location": map[string]interface{}{
				"latitude":  lat,
				"longitude": lng,
			},
		}

		body, _ := json.Marshal(GQLRequest{
			Query:         mutation,
			OperationName: "createDeal",
			Variables: map[string]interface{}{
				"input": input,
			},
		})

		go func(i int, city string, payload []byte) {
			defer wg.Done()

			resp, err := client.Post(url, "application/json", bytes.NewReader(payload))
			if err != nil {
				fmt.Printf("[%d] %s failed: %v\n", i, city, err)
				return
			}
			defer resp.Body.Close()

			if resp.StatusCode != 200 {
				bodyBytes, _ := io.ReadAll(resp.Body)
				fmt.Printf("[%d] %s HTTP %d\n→ Payload: %s\n→ Response: %s\n", i, city, resp.StatusCode, string(payload), string(bodyBytes))
			} else {
				fmt.Printf("[%d] %s inserted\n", i, city)
			}
		}(i, city, body)

		time.Sleep(30 * time.Millisecond)
	}

	wg.Wait()
	fmt.Printf("Launched %d spicy deals around %s within %.2f km radius!\n", numDeals, city, radiusKm)
}
