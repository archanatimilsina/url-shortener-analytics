# URL Shortener with Analytics

A rate-limited URL shortener built with Django REST Framework and React, featuring custom IP-based rate limiting and a click analytics dashboard.

## Tech Stack

- **Backend:** Django, Django REST Framework, SQLite
- **Frontend:** React (Vite), styled-components, Chart.js



## Running the Project

```bash
docker compose up --build
```

- Backend: http://localhost:8000
- Frontend: http://localhost:5173

## Rate Limiter

- **Algorithm:** Fixed Window
- **Rule:** max 5 shorten-requests per IP every 60 seconds
- **How it works:** a decorator (`@rate_limit(max_requests=5, window_seconds=60)`) checks
  each IP's request count using Django's cache before the view runs.
- **If limit is hit:** returns `429`, with a JSON body showing `retry_after_seconds`, plus
  a `Retry-After` header.
- **Tradeoff:** Fixed Window can allow a short burst near the edge of a window. A Sliding
  Window would avoid this but adds complexity.

## Design Decisions

- **Random aliases, not hashed.** See explanation below.
- **No login/auth.** All URLs and stats are public.
- **Polling, not real-time push.** Chart re-fetches every 10s with `setInterval` instead
  of using WebSockets is simplier.
- **Zero-filled stats.** The 7-day stats always return all 7 days, even ones with 0 clicks,
  so the chart never has gaps.

## Why random aliases instead of hashing?

A hash-based alias always produces the same alias
for the same URL. That sounds convenient, but it means shortening one URL twice would
just return the same link twice and no way to track two separate shares separately.

Using `secrets.choice()` generates a random alias each time, so every shortened link gets
its own independent click history and it is better suited to this project's analytics focus.
`secrets` (not `random`) is used specifically because it's cryptographically secure —
aliases can't be predicted or guessed.



## API
### `POST /api/shorten/` - **Create a short URL.**

**Request:**
```json
{ "url": "http://localhost:8000/api/shorten" }
```

**Response (201):**
```json
{ "alias": "aB3xY9", "original_url": "https://website.com", "created_at": "2026-07-05T10:00:00Z" }
```

**Response (429, rate limited):**
```json
{ "error": "Rate limit exceeded.", "retry_after_seconds": 42 }
```


### `GET /api/urls/` - **List all shortened URLs.**
**Response (200):**
```json
[
  { "alias": "aB3xY9", "original_url": "https://website.com/age/99", "created_at": "2026-07-05T10:00:00Z" }
]
```

### `GET /{alias}` - **Redirects to the original URL and logs a click. Returns `404` if the alias doesn't exist.**


### `GET /api/urls/{alias}/stats/` - **Returns click counts for the last 7 days.**



