# Server (backend)

Node + TypeScript backend for the Smart Complaint Routing System (SCRS).

Overview
- The backend exposes REST endpoints for citizens and admins, persists data in PostgreSQL via Prisma, and contains in-memory ADSA modules used for routing and processing demonstrations.

Technology stack
- Node.js, Express, TypeScript
- Prisma ORM connecting to PostgreSQL
- JWT authentication (JSON Web Tokens)
- `bcryptjs` for password hashing

Quick start (Windows, PowerShell)
1. Ensure Node.js and PostgreSQL are installed and running on your machine.
2. Create a database and set `DATABASE_URL` in a `.env` file inside the `server` folder. Example `.env` line:

```
DATABASE_URL=postgresql://user:password@localhost:5432/scrs_dev
```

3. Install dependencies and generate Prisma client:

```powershell
cd server
npm.cmd install
npm.cmd run prisma:generate
```

4. Run migrations (first time):

```powershell
npm.cmd run prisma:migrate
```

5. Run the server in development:

```powershell
npm.cmd run dev
```

Seeding (demo data)
- Seed the demo fixtures:

```powershell
cd server
npm.cmd run seed
```

- Reset (remove only demo records seeded by fixtures):

```powershell
cd server
npm.cmd run seed:reset
```

Demo data seeded by the script:
- 3 demo users (1 admin, 2 citizens)
- 8 departments
- 5 representative complaints (varied categories, priorities, statuses)

Demo credentials (demo only)
- Admin: admin@example.com / Admin@123
- Citizen 1: citizen1@example.com / Citizen@123
- Citizen 2: citizen2@example.com / Citizen@123

Testing & build
- Run tests: `npm.cmd run test`
- Build backend: `npm.cmd run build`

Files of interest
- `src/dsa/` — ADSA data structures (heap, queue, hash map, graph) and routing service.
- `src/algorithms/` — sorting and searching implementations.
- `prisma/schema.prisma` — database models and enums.
- `prisma/seed.ts` — demo seed script (idempotent via upsert) and fixtures under `prisma/fixtures/`.

Troubleshooting (brief)
- If `DATABASE_URL` is incorrect, Prisma/connection errors will point to connection failures — verify credentials and reachable host/port.
- On Windows PowerShell, if `npm` script execution is blocked, use `npm.cmd` and `npx.cmd` as shown above.
- If `prisma generate` fails after schema changes, run `npm.cmd run prisma:generate` and then `npm.cmd run prisma:migrate` if needed.

This README contains seeding and backend run instructions — see the project root README for higher-level ADSA explanations and examples.

Benchmarks
----------
This project includes simple benchmark scripts to illustrate relative performance
of the in-project ADSA implementations (heap, queue, hash map, graph/Dijkstra,
merge/quick sort, linear/binary search). Benchmarks are intended for local
experiments and educational demonstrations — results depend heavily on the
machine and environment.

Run benchmarks (Windows PowerShell):

```powershell
cd server
npm.cmd run benchmark
```

What is measured
- Average execution time (ms) over multiple iterations for each algorithm and
	operation, across a range of input sizes (100, 1,000, 5,000, 10,000).
- Benchmarks call the project's custom implementations (no use of native
	Array.sort for sorting measurements).

Interpreting results
- Compare relative speeds at the same input size; remember that differences
	are illustrative and not absolute performance guarantees. The benchmark
	output includes a notice that hardware, Node.js version, dataset size,
	input distribution and system load affect timings.

ADSA complexity notes (summary)
- Heap / Priority Queue: insert/extract ~ O(log n)
- Processing Queue: enqueue/dequeue ~ O(1) amortized
- Hash Map (separate chaining): average O(1) get/set/delete, worst-case O(n)
- Department Graph + Dijkstra: routing ~ O(E log V) with a priority queue
- Merge Sort: O(n log n) time, O(n) extra space (stable)
- Quick Sort: average O(n log n), worst-case O(n^2) depending on pivot
- Linear Search: O(n)
- Binary Search: O(log n) on sorted input

Benchmarks are located in `src/benchmarks/` and are safe to run locally.

## Seeding demo data (DEV / demonstration)

This project includes a safe, repeatable demo seed to populate representative users, departments and complaints for ADSA demonstrations.

- Run the seed:

```powershell
cd server
npm run seed
```

- Reset (remove only demo records seeded by the fixtures):

```powershell
cd server
npm run seed:reset
```

Demo credentials (created by the seed):

- Admin: admin@example.com / Admin@123
- Citizen 1: citizen1@example.com / Citizen@123
- Citizen 2: citizen2@example.com / Citizen@123

Seed notes:
- The seed uses `bcryptjs` to hash passwords to match the application's `authService`.
- The seed is idempotent (uses `upsert`) and uses stable identifiers so re-running will not create uncontrolled duplicates.
- Departments are created with IDs that match the department-graph expectations (e.g. `water`, `roads`, `electricity`, ...). The built-in graph loader will load departments and create links for routing demonstrations.
- The seed includes a brief verification run that loads the department graph, demonstrates routing for seeded complaints, and runs a small sort/search check.

If you want to inspect or modify the demo fixtures, see `server/prisma/fixtures/*.json` and the seeding logic in `server/prisma/seed.ts`.
