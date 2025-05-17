# Problem Statement
## Problem Overview

You are to design and implement a microservice that powers the “live deals” feature of a location‑based marketplace. 
Users can open a map and see special deals offered by vendors in their current area; as they pan or zoom the map, new deals must load instantly, and any newly posted deals within their visible region should appear without manual refresh.

### Candidate Task Description
 
 #### Map‑Viewport Registration:
 
 - Clients send their current bounding‐box (min/max latitude & longitude) to the service.
 
 - The service returns all existing deals within that box almost instantly.
 
 #### Live Updates:
 
 - When any vendor posts a new deal, all clients whose registered viewport intersects that deal’s location should receive the update immediately—without polling.
 
 #### Performance Under Load:
 
 - The system should support hundreds of concurrent clients, each with different viewports, and thousands of deals.
 
 - Latency for both initial queries and updates should remain low (<100 ms).

### Functional Requirements
 - Range Query Endpoint: Accepts geographic rectangle parameters and returns matching deals.
 - Subscription Endpoint: Clients open a persistent connection to receive real‑time notifications for new deals in their area.
 - Insert Endpoint: Vendors can post new deals with geo‑coordinates; these are indexed and propagated to subscribers as needed.

### Technical Requirements
 - Efficient Spatial Indexing: The service must index deal locations in a way that supports fast multi‑dimensional range queries, grouping nearby items into bounding rectangles to prune searches efficiently.
 - Push‑Based Client Updates: Implement a long‑lived connection protocol that lets the server push new deal events to subscribed clients as soon as they occur, avoiding client polling.
 - In‑Memory Data Layer: Use an in‑memory store to keep hot deal data and manage client subscriptions, both to speed up query responses and to fan out notifications with minimal overhead.
 Backend : GoLang with GraphQL
 Frontend: NextJs with Apollo Client

# Checklist
- [x] Clients send their current bounding‐box (min/max latitude & longitude) to the service.
- [x] The service returns all existing deals within that box almost instantly.
- [x] When any vendor posts a new deal, all clients whose registered viewport intersects that deal’s location should receive the update immediately—without polling.
  - We don’t poll here. Tile38 pushes events when you move your map.
- [x] The system should support hundreds of concurrent clients, each with different viewports, and thousands of deals.
  - Each user’s viewport is a geofence stream.
  - This backend doesn’t care if you have 5 users or 5000. Tile38 handles the math. 
  - Proven to support around 1.2k easily on `chintu`(laptop with 16G ryzen 7530U running arch server), could have been more but its a home network routed through cloudflare tunnels
    - Will need more profiling and testing before making any more claims...might or might not do
    - Metrics are tracked in Prometheus. Graphs are live in Grafana. Load is verified.
     ![image](https://github.com/user-attachments/assets/49e4e57c-8f20-4e87-aff9-f96eaa3e7c16)
- [x] Latency for both initial queries and updates should remain low (<100 ms).
- [x] Range Query Endpoint: Accepts geographic rectangle parameters and returns matching deals.
- [x] Subscription Endpoint: Clients open a persistent connection to receive real‑time notifications for new deals in their area.
- [ ] Insert Endpoint: Vendors can post new deals with geo‑coordinates; these are indexed and propagated to subscribers as needed.
  - Might do later, is trivial
- [x] Efficient Spatial Indexing: The service must index deal locations in a way that supports fast multi‑dimensional range queries, grouping nearby items into bounding rectangles to prune searches efficiently.
  - This is supported by [Tile38](https://tile38.com/)
- [x] Push‑Based Client Updates: Implement a long‑lived connection protocol that lets the server push new deal events to subscribed clients as soon as they occur, avoiding client polling.
- [x] In‑Memory Data Layer: Use an in‑memory store to keep hot deal data and manage client subscriptions, both to speed up query responses and to fan out notifications with minimal overhead.
  - Redis stores deals metadata and also for the time being acts as a db, next action would prolly be to migrate the deals metadata to a db but this is alright for demonstration purposes
- [x] Backend : GoLang with GraphQL
  - Using [Graphqlgen](https://gqlgen.com/) for the graphql server in the backend
- [x] Frontend: NextJs with Apollo Client
  - I use apollo client graphql and graphql-ws alongwith next, react-leaflet for frontend
     
## Other additions apart from the the above requirements
- [x] Dockerized stack
- [x] Prometheus + Grafana setup
  - Live metrics:
    - WebSocket subscription count
    - Request rates (by operation)
    - GraphQL latency histograms
    - Tile38 ping health
- [x] Clean cancellation of geofences per user when viewport changes
- [x] Debounced viewport tracking to avoid overload from pan-spam
- [x] GraphQL subscriptions backed by Tile38 geofences, not Go channels

## Planned features
 - [ ] Stress testing endpoints and/or dashboard buttons for bulk deal insertion and clearing (next step)
 - [ ] TTL-aware deal expiry syncs
