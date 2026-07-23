# Lets Connect Eswatini — Backend

**NestJS 11 social platform backend** · TypeScript 5.7 · NATS JetStream · 36 tests

Social connectivity infrastructure built for Eswatini. Five production modules: phone-OTP auth with Proof-of-Work anti-DDoS, Clustered Mitochondria content pipeline, two-layer malware + spam moderation, and an adaptive configuration engine with approval gates.

---

## Architecture

```
Client
  │
  ├─ POST /auth/request-otp     ──►  ProofOfWorkService (SHA-256, 20-bit difficulty)
  │                                   └─► OtpService (6-digit, 5-min TTL, timingSafeEqual)
  │
  ├─ POST /auth/verify-otp      ──►  AuthService → JWT (HS256)
  │                                   └─► OTP failure tracking → 1-hr ban after 3 failures
  │
  ├─ POST /compress/process     ──►  MitochondrionNode
  │                                   ├─ size gate (1 MB)
  │                                   ├─ brotli compress (quality 4)
  │                                   ├─ 384-dim embedding stub (SHA-256 expanded)
  │                                   └─► NATS publish: lce.v1.mito.<contentType>
  │
  ├─ POST /moderation/check     ──►  ModerationService
  │                                   ├─ SpamClassifierService (weighted score → verdict)
  │                                   └─► NATS queue: lce.v1.moderation.queue (async LLM)
  │
  ├─ GET  /api/adaptive/pending ──►  AdaptiveConfigService (pending change proposals)
  ├─ POST /api/adaptive/approve/:id
  ├─ POST /api/adaptive/reject/:id
  │
  └─ GET  /health               ──►  { status: 'ok', ts }
```

---

## Modules

### Auth

Phone-based OTP authentication with Proof-of-Work gating.

**Flow:**
1. Client mines a PoW solution: find `nonce` such that `SHA256("lce-pow:" + nonce)` starts with 5 hex zeros (2²⁰ ≈ 1M iterations). Prevents OTP request floods without requiring accounts.
2. `POST /auth/request-otp` — verifies PoW, checks ban, issues 6-digit OTP (5-min TTL). In production: sent via MTN MoMo SMS API.
3. `POST /auth/verify-otp` — `timingSafeEqual` comparison. Returns JWT on success. Records failure (3 failures in 10 min → 1-hour ban).

| Service | Responsibility |
|---|---|
| `ProofOfWorkService` | SHA-256 PoW verify + challenge generation |
| `OtpService` | In-memory OTP store, 5-min TTL, constant-time compare |
| `AuthService` | Orchestration: PoW → ban check → OTP → JWT, bcrypt (12 rounds) |

---

### Compression — Clustered Mitochondria

Content pipeline: validate → compress → embed → route.

**`MitochondrionNode.process(payload)`**

1. **Size gate** — rejects payloads > 1 MB
2. **Brotli compress** — quality 4 (balanced speed/ratio for real-time data)
3. **Embedding stub** — SHA-256 hash of content expanded to 384-dim float32 vector `[-1, 1]` (wire-compatible with ONNX embedding server when wired)
4. **NATS routing** — publishes to `lce.v1.mito.<contentType>` (`message` | `post` | `file` | `telemetry`)

```
POST /compress/process
{ clientId, contentType, data }
→ { packetId, natsSubject, compressionRatio, embeddingDim: 384, processedAt }
```

---

### Moderation

Two-layer content moderation: synchronous heuristics + asynchronous LLM review.

**Spam Classifier** — weighted score → `ALLOW` / `CHALLENGE` / `SHADOWBAN` / `BLOCK`:

| Signal | Points |
|---|---|
| OTP failures ≥ 3 | +40 |
| Account age < 5 min | +25 |
| Link density > 0.5 | +20 |
| Post velocity > 20/hr | +15 |
| Missing device fingerprint | +10 |

Score ≥ 75 → `BLOCK` · ≥ 50 → `SHADOWBAN` · ≥ 30 → `CHALLENGE` · < 30 → `ALLOW`. Fails closed on any exception (returns `BLOCK, score=100`).

**Malware Engine** — two-layer scan:

| Layer | Mechanism |
|---|---|
| ClamAV | TCP INSTREAM protocol to `clamd` socket (2-sec timeout, falls through if unavailable) |
| YARA stubs | EICAR test file · PowerShell download strings · JS `eval(atob/unescape/decodeURIComponent)` |

Verdicts: `CLEAN` · `SUSPICIOUS` · `INFECTED` · `ERROR`. Non-empty content is escalated to `lce.v1.moderation.queue` for async LLM review.

---

### Optimization — Adaptive Config

Runtime parameter proposals with a >20% change approval gate.

```
POST /api/adaptive/propose    (via service, not exposed as HTTP — called internally)
GET  /api/adaptive/pending    → list of pending PendingChange objects
POST /api/adaptive/approve/:id
POST /api/adaptive/reject/:id
```

Any parameter change > 20% sets `requiresApproval: true` — must be explicitly approved before taking effect. Provides audit trail for all configuration mutations.

---

## Security

| Control | Implementation |
|---|---|
| DDoS / OTP abuse | SHA-256 Proof-of-Work (2²⁰ difficulty) before any OTP issuance |
| OTP timing attacks | `crypto.timingSafeEqual` on OTP comparison |
| OTP brute-force | 3-failure-in-10-min → 1-hour account ban |
| JWT | HS256, issued only after OTP verification |
| Password storage | bcrypt, 12 rounds |
| Input validation | NestJS `ValidationPipe` (`whitelist: true`, `transform: true`) on all routes |
| CORS | Allowlist via `CORS_ORIGINS` env var |
| Malware | ClamAV INSTREAM + YARA regex fallback |
| Config changes | > 20% delta requires explicit approval |

---

## API Reference

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/request-otp` | None | PoW-gated OTP request |
| `POST` | `/auth/verify-otp` | None | Verify OTP → JWT |
| `POST` | `/compress/process` | JWT (planned) | Mitochondria content pipeline |
| `POST` | `/moderation/check` | JWT (planned) | Fast-path + NATS escalation |
| `GET` | `/api/adaptive/pending` | Internal | List pending config changes |
| `POST` | `/api/adaptive/approve/:id` | Internal | Approve a config change |
| `POST` | `/api/adaptive/reject/:id` | Internal | Reject a config change |
| `GET` | `/health` | None | `{ status: 'ok', ts }` |

---

## Test Suite

**36 tests across 8 suites, 0 failures.**

| Suite | Tests | Covers |
|---|---|---|
| `AdaptiveConfigService` | 9 | propose/approve/reject, >20% gate, immutability |
| `SpamClassifierService` | 7 | score thresholds, verdict boundaries, fail-closed |
| `MalwareEngineService` | 7 | EICAR, PowerShell, JS obfuscation, benign, empty |
| `AuthService` | 3 | PoW reject, OTP reject, bcrypt hash+compare |
| `MitochondrionNode` | 4 | pipeline, NATS routing, size gate, determinism |
| `CompressionService` | 2 | compress/decompress round-trip, ratio |
| `ProofOfWorkService` | 2 | invalid formats, challenge format |
| `ModerationService` | 2 | empty content, NATS escalation |

```bash
npm test
npm run test:cov
```

---

## Stack

```
NestJS 11 · TypeScript 5.7 · NATS 2.28 · JWT · bcryptjs
brotli (Node zlib) · ClamAV (TCP INSTREAM) · Jest + ts-jest
```

---

## Setup

```bash
npm install

# Development (ts-node, console OTP logs)
npm run start:dev

# Production build
npm run build && npm start
```

**Environment variables:**

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | HTTP listen port |
| `JWT_SECRET` | — | **Required.** HS256 signing key |
| `CORS_ORIGINS` | `*` | Comma-separated allowed origins |
| `CLAMD_HOST` | `localhost` | ClamAV daemon host |
| `CLAMD_PORT` | `3310` | ClamAV daemon port |
| `NODE_ENV` | — | Set to `production` to suppress OTP console logs |

**NATS streams to create:**

| Subject | Purpose |
|---|---|
| `lce.v1.mito.*` | Mitochondria content routing (message/post/file/telemetry) |
| `lce.v1.moderation.queue` | Async LLM moderation review queue |

---

## Status

Building — backend infrastructure complete. Frontend and MTN MoMo SMS integration pending.

| Component | Status |
|---|---|
| Auth (OTP + PoW + JWT) | ✓ Complete |
| Compression pipeline | ✓ Complete |
| Spam classifier | ✓ Complete |
| Malware engine | ✓ Complete |
| Adaptive config | ✓ Complete |
| NATS JetStream wiring | Pending |
| ONNX embedding server | Pending (stub in place) |
| MTN MoMo SMS delivery | Pending |
| Frontend | Pending |

---

Built by [BRT Inc.](https://brtinc.dev) · Manzini, Eswatini
