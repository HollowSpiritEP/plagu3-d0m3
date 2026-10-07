# plagu3-d0m3

The PlAGU3 D0M3 — Hunger Games simulator (MVP scaffold).

Twenty-four tributes from the twelve districts are thrown into an arena; a
seeded simulation plays out the Bloodbath, the days and nights in between, and
a single victor. Because the simulation is seeded, the same seed always
produces the exact same Games.

## Stack

- React 18 + Vite 6 (frontend only — the simulation runs in the browser, so no
  database or API is required)
- Simulation logic is pure JavaScript in `src/game/`, independent of React

## Running it

### In the Base44 sandbox

```bash
docker compose -f docker-compose.base44.yml up -d --build
```

The app is served on <http://localhost:3000>.

### Locally without Docker

```bash
npm ci
npm run dev
```

## Project layout

```
src/
  App.jsx                 playback state machine + layout
  components/             Controls, StatsBar, RosterPanel, EventFeed, VictoryBanner, TributeCard
  game/
    random.js             seeded PRNG (mulberry32) + weighted picks/shuffles
    tributes.js           districts and tribute generation
    simulation.js         runs a full Games from a seed
```

## How it works

`runSimulation(seed)` returns `{ tributes, phases, victor, days }`.

- 24 tributes are generated from the seed, with career districts (1, 2, 4)
  starting stronger.
- Phase 0 is the Bloodbath at the Cornucopia; survivors pick up weapons.
- Then each day runs a `Day` phase (plus a `Feast` on one day) and a `Night`
  phase. Weaker tributes are likelier to die; most deaths are kills.
- When two remain, they meet in a final duel. The last tribute standing is the
  victor.
- Every phase carries `aliveIds`, the snapshot of who is still standing after
  it — the UI reveals phases one at a time and derives the roster from that.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Vite dev server on port 3000 |
| `npm run build` | Production bundle into `dist/` |
| `npm run serve` | Preview a built bundle |
