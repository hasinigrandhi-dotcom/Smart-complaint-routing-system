# Smart Complaint Routing System (SCRS)

Academic project demonstrating Advanced Data Structures & Algorithms (ADSA) in a full-stack web app for managing citizen complaints.

What it is
- SCRS shows how classic ADSA structures (heap, queue, hash map, graph) and algorithms (Dijkstra, merge/quick sort, binary/linear search) can be used inside a real web application to route and process citizen complaints.

Who this is for
- Undergraduate ADSA students and instructors who want a runnable demonstration linking algorithmic ideas to an Express + React stack.

Structure
- `client`: React + Vite frontend (TypeScript).
- `server`: Node + Express backend (TypeScript) with Prisma and PostgreSQL.

Note on optional infra: the repo contains development helpers (may include docker-compose in `infra/`), but this project assumes PostgreSQL is available on the host (Windows) for demonstrations — Docker is not required.
