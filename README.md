# Problem Statement
Problem Overview
You are to design and implement a microservice that powers the “live deals” feature of a location‑based marketplace. Users can open a map and see special deals offered by vendors in their current area; as they pan or zoom the map, new deals must load instantly, and any newly posted deals within their visible region should appear without manual refresh.

Candidate Task Description
 Map‑Viewport Registration:
 Clients send their current bounding‐box (min/max latitude & longitude) to the service.
 The service returns all existing deals within that box almost instantly.
 Live Updates:
 When any vendor posts a new deal, all clients whose registered viewport intersects that deal’s location should receive the update immediately—without polling.
 Performance Under Load:
 The system should support hundreds of concurrent clients, each with different viewports, and thousands of deals.
 Latency for both initial queries and updates should remain low (<100 ms).

Functional Requirements
 Range Query Endpoint: Accepts geographic rectangle parameters and returns matching deals.
 Subscription Endpoint: Clients open a persistent connection to receive real‑time notifications for new deals in their area.
 Insert Endpoint: Vendors can post new deals with geo‑coordinates; these are indexed and propagated to subscribers as needed.

Technical Requirements
 Efficient Spatial Indexing: The service must index deal locations in a way that supports fast multi‑dimensional range queries, grouping nearby items into bounding rectangles to prune searches efficiently.
 Push‑Based Client Updates: Implement a long‑lived connection protocol that lets the server push new deal events to subscribed clients as soon as they occur, avoiding client polling.
 In‑Memory Data Layer: Use an in‑memory store to keep hot deal data and manage client subscriptions, both to speed up query responses and to fan out notifications with minimal overhead.
 Backend : GoLang with GraphQL
 Frontend: NextJs with Apollo Client

# Welp
- idk man seems like a chore
