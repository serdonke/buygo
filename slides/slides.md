## Live Deals Microservice
Prateek Shukla
---
## System Architecture
![System Design](sysdesign.png)
---

## Technical Requirements 

- ✅ Efficient spatial indexing  
  - Used `Tile38` to index deals by location and support *fast* bounding box queries

- ✅ Push-based real-time updates  
  - Used `GraphQL` subscriptions over WebSockets with `graphql-ws`

- ✅ In-memory fast-access layer  
  - Initially Go mutex + slice, later replaced by `Redis` with TTL and persistence

---
## Functional Requirements

- ✅ Show deals in user's current map viewport  
  - Implemented via `dealsInViewport(boundingBox)` `GraphQL` query  
  - Supports pagination and cursor-based traversal

- ✅ Auto-update when new deals appear  
  - `Tile38` geofences trigger events  
  - Events are broadcasted using `GraphQL` subscriptions (`dealCreatedInViewport`)

- ✅ Handle many concurrent clients/viewports  
  - Each client subscribes to a geofenced bounding box  
  - Real-time updates are pushed to clients via Tile38 geofence events  

- ✅ Enable vendors to insert deals with TTL
---

## Extras

- Switched from Go in-memory slice + mutex storage to `Redis` as the canonical store
- Implemented `Redis` TTL support and used `ExpiresAt` on deal inserts
- Added automatic `Tile38` rehydration from `Redis` on backend startup
- Added `Prometheus` metrics:
  - deal creation count
  - active viewport subscriptions
  - `Tile38` query and geofence latency
- Integrated `Grafana` dashboards to observe backend behavior in real time
- Dockerized entire stack (backend, frontend, `Redis`, `Tile38`, `Grafana`, `Prometheus`)

---
## Debugging and Challenges

- `Tile38` and `Redis` TTL were not in sync → resulted in orphaned spatial objects and `redis: nil` errors
  - Fixed by treating `Redis` as source of truth and rehydrating `Tile38` at startup
- `Tile38` Go client (`t38c`) lacked `.EX()` TTL support in `.Set()`
  - Worked around using separate `Expire(...)` call after each insert
- `t38c` also lacked `FlushAll` and raw `Do(...)` interface
  - Had to dig into client library source code to find real method names (e.g. `Flush = FLUSHDB`)
---
## Planned Features
- Migrate to a real database (e.g. PostgreSQL) for storing deal metadata
- Add vendor authentication and rate limiting per vendor
- Build a user-friendly list view and vendor dashboard for better UX
- Stress testing endpoints and/or dashboard buttons for bulk deal insertion and clearing (GraphQL Playground for now)
- TTL-aware deal expiry sync between Redis and frontend
---
## Summary

- Fully working backend for real-time, location-aware deal delivery
- Efficient use of `Redis`, `Tile38`, and `GraphQL` subscriptions
- Scalable, observable, and dockerized
- Frontend supports live updates and geospatial viewports
- All built in 5 days, with flexibility to extend and harden for production
