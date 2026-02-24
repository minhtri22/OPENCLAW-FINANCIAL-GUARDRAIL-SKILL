# OpenClaw Financial Guardrail Skill

Production-grade financial guardrail layer for OpenClaw to prevent runaway token spending, detect cost anomalies, and stop infinite AI execution loops.

## Features
- Deterministic budget wallet per task/agent
- Loop protection with cooldown and delta threshold
- Cost auditor that ignores agent-reported costs and computes real cost from tokens
- Circuit breaker for cost spikes
- JSONL usage ledger for auditable usage
- Local-first storage (no Postgres/Redis required)
- AES-256 encryption for API keys (no plaintext logging)

## Install
```bash
npm install
```

## Build
```bash
npm run build
```

## Test
```bash
npm run test
```

## Configuration
Edit `src/config/guardrail.config.ts`.

Required config values:
- `minReserveRatio`: default 0.3
- `maxExecutionPerDay`: default 10
- `cooldownWindowMinutes`: default 60
- `deltaThreshold`: default 0.1
- `tokenPricePer1k`: default 0.5
- `costSpikeMultiplier`: default 3
- `costHistoryWindow`: default 20
- `forbiddenAuthorityKeys`: defaults to tier/budget related keys

## Usage
```ts
import { createGuardrail } from "./dist";

const guardrail = createGuardrail("./data", process.env.GUARDRAIL_KEY || "32-bytes-minimum-key__________");

await guardrail.budget.init({
  totalCapital: 1000,
  maxDailyBurn: 200,
  reserveCapital: 300,
  currentDailySpend: 0,
  lastSpendDate: new Date().toISOString().slice(0, 10),
});

const ok = await guardrail.budget.spend(20, "agent-run");
if (!ok) throw new Error("Budget limit hit");

await guardrail.loop.assertExecution("task-1", 0.42);

const usage = await guardrail.auditor.audit({
  promptTokens: 500,
  completionTokens: 250,
  reason: "plan-run",
});
```

## Security Notes
- Provide AES-256 key via environment (`GUARDRAIL_KEY`).
- Never log plaintext API keys; use `KeyVault` to encrypt/decrypt.

## Repo Layout
```
/src
  /core
    /domain
    /engine
  /infra
  /config
  index.ts
/tests
README.md
```

## License
MIT

## Example: OpenClaw Runner Integration

Build first:
```bash
npm run build
```

Run the example:
```bash
node examples/openclaw-runner.ts
```

The example:
- initializes a local budget wallet
- enforces loop guard
- records audited usage
