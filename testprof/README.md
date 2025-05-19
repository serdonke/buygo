# Deal Stress Tools

Go scripts for hammering the GraphQL backend with deal inserts and viewport subscriptions. 


---

## Scripts

### `deal-stress.go`

Creates a bunch of fake deals in random locations.

- Prompts:
  - City name
  - Radius (km)
  - Number of deals
- Resolves city -> lat/lon using [nominatim](https://nominatim.org/) 
- Fires concurrent GraphQL `createDeal` mutations
- Waits for completion
- Loops for more

Run it:

```bash
go run deal-stress.go
````

---

### `viewport-stress.go`

Simulates many WebSocket clients subscribing to random bounding boxes.

- Prompts:

  - Number of connections
- Each connection:

  - Subscribes to viewport updates
  - Changes bounding box every 5–10 seconds
  - Stays alive
- Logs all connection statuses every 10 seconds

Run it:

```bash
go run viewport-stress.go
```

---

## Notes

- URLs like `backend.serdonke.xyz` may stop working. Change them if self-hosting.
- Cloudflare tunnels or home networks may throttle or drop connections under high concurrency.

