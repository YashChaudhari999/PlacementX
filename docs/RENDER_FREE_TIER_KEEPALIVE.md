# Render Free-Tier Liveness and Redis Readiness

## Architecture

PlacementX runs two Render services in Singapore:

- `placementx-api`: Express API, PostgreSQL through Prisma, Firebase authentication, Socket.IO, and BullMQ producers/workers.
- `placementx-redis`: Render Key Value (Valkey 8, Redis-compatible), reached only through Render's private network using `REDIS_URL`.

Redis stores the notification queues (`notification-immediate`, `notification-scheduled`, and `notification-bulk`), the `report-generation` queue, and the system-settings cache. Authentication and sessions do not use Redis.

Notification jobs retry three times with exponential backoff; bulk-notification jobs retry five times. Report jobs retry three times. Queue workers start once after the shared Redis client first becomes ready and are closed before Redis during graceful shutdown.

## Health endpoints

Both endpoints are public and return minimal JSON without credentials, internal addresses, stack traces, or dependency details.

### API liveness

```text
GET https://placementx-api.onrender.com/health
200 {"status":"ok"}
```

This checks only that the Express process can respond. It does not query PostgreSQL, Redis, or another external service.

### API and Redis readiness

```text
GET https://placementx-api.onrender.com/health/ready
200 {"status":"ready"}
503 {"status":"not_ready"}
```

Readiness reuses the application's existing Redis client and sends `PING`. Redis commands have a two-second timeout, so repeated probes do not wait indefinitely. This endpoint does not create Redis clients, queues, or workers.

## Deployment

Render deploys `main` from the configured GitHub repository. The API requires:

```text
REDIS_URL=<Render Key Value internal connection URL>
REDIS_REQUIRED=true
```

Keep the Key Value instance and API in the same Render region. Never place the internal connection URL in Git or expose Redis publicly.

After pushing changes, confirm the Render deployment is live and review startup logs for:

```text
Redis connected successfully.
Notification queues initialized.
Notification workers started.
Report queue initialized.
Report worker started.
```

## Testing with curl

```bash
curl -i https://placementx-api.onrender.com/health
curl -i https://placementx-api.onrender.com/health/ready
```

The first command should return HTTP 200 whenever the API process is running. The second returns HTTP 503 while Redis is unavailable or reconnecting.

## UptimeRobot setup

Create these monitors manually; PlacementX does not configure an external monitoring account.

### Monitor A — API liveness

- Monitor type: HTTP(S)
- Friendly name: `PlacementX API liveness`
- URL: `https://placementx-api.onrender.com/health`
- Interval: 5 minutes
- Success condition: HTTP 200

### Monitor B — API and Redis readiness

- Monitor type: HTTP(S)
- Friendly name: `PlacementX API and Redis readiness`
- URL: `https://placementx-api.onrender.com/health/ready`
- Interval: 5 minutes
- Success condition: HTTP 200

Both monitors call the API; Redis remains private. The readiness route checks Redis from inside the backend. A readiness HTTP 503 is a useful dependency alert and does not necessarily mean the API process has stopped—check the liveness monitor to distinguish the two cases.

Do not add an in-process keep-alive timer. A timer stops when Render spins the API down and cannot wake it.

## Redis recovery and BullMQ behavior

The shared `ioredis` client uses a five-second connection timeout, a two-second command timeout, and capped exponential reconnect delays up to five seconds. Connection loss, reconnect attempts, and recovery are logged without exposing the Redis URL. BullMQ keeps its normal retry behavior; failed jobs are not silently acknowledged.

The API shuts down in this order: HTTP server, notification workers and queues, report worker and queue, Redis, then PostgreSQL. Initialization is idempotent so health requests and Redis events cannot create duplicate clients or workers.

When Redis is unavailable, readiness returns 503. Existing synchronous fallbacks remain in place for notification and report operations that find Redis disconnected. Delayed in-process notification fallbacks are not durable across API restarts.

Render Free Key Value is in-memory and does not persist data across restarts or upgrades. Reconnection restores connectivity, not lost BullMQ jobs, delayed work, or cached values. Use a persistent paid Key Value plan or store critical work durably in PostgreSQL before enqueueing if those jobs must survive Redis data loss.

## Render free-tier limits

Render Free web services spin down after 15 minutes without incoming traffic and can take approximately one minute to wake. Five-minute external monitoring can reduce cold starts, but missed probes, deployments, maintenance, and independent Render restarts can still cause them.

The workspace receives 750 free instance-hours per calendar month. A continuously active instance in a 31-day month consumes about 744 hours, leaving roughly six hours for other free web-service usage. Monitor instance hours, deployment activity, and bandwidth.

Free Key Value does not follow the web-service 15-minute inactivity spin-down rule, so it does not need a keep-alive loop. Render can still restart it or make it temporarily unavailable, and health traffic cannot preserve its in-memory contents.

External monitoring reduces idle cold starts; it does not guarantee zero downtime or continuous Redis availability.

## Troubleshooting

| Result | Meaning and action |
|---|---|
| HTTP 200 on `/health` | API process is responding. |
| HTTP 200 on `/health/ready` | API can currently ping Redis. |
| HTTP 401 | The monitor URL points at an authenticated API route; use the exact public paths above. |
| HTTP 404 | The deployment is old or the path is incorrect; confirm the latest commit is live. |
| HTTP 500 | Inspect sanitized API and Render logs for an application error. |
| HTTP 503 on readiness | Redis is disconnected, reconnecting, or timed out; check Key Value status and API reconnect logs. |
| Timeout on both monitors | The API may be waking from sleep or unavailable. Wait for startup, then inspect Render deploy/runtime logs. |
| Liveness 200, readiness 503 | Express is healthy but Redis is unavailable. |

Liveness answers whether the API process can respond. Readiness answers whether Redis-dependent work is currently available. Neither endpoint proves uninterrupted service between probes.
