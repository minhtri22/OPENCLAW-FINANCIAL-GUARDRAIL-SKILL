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

const guardrail = createGuardrail("./data", process.env.GUARDRAIL_KEY || "0123456789abcdef0123456789abcdef");

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

## Integration With OpenClaw
A minimal flow that matches the OpenClaw agent lifecycle:

1. Initialize the guardrail with a persistent data directory and AES-256 key.
2. Before each agent execution, call `budget.spend(...)` and `loop.assertExecution(...)`.
3. After each execution, call `auditor.audit(...)` using real token counts.
4. Store ledgers and state locally under the chosen data directory.

Example (runner skeleton):
```ts
import { createGuardrail } from "./dist";

const guardrail = createGuardrail("./data", process.env.GUARDRAIL_KEY || "0123456789abcdef0123456789abcdef");

await guardrail.budget.init({
  totalCapital: 1000,
  maxDailyBurn: 200,
  reserveCapital: 300,
  currentDailySpend: 0,
  lastSpendDate: new Date().toISOString().slice(0, 10),
});

export async function runTask(taskId: string, signal: number) {
  const allowed = await guardrail.budget.spend(20, "agent-run");
  if (!allowed) throw new Error("Budget limit hit");

  await guardrail.loop.assertExecution(taskId, signal);

  // Run your OpenClaw agent here and compute real token usage.
  const promptTokens = 500;
  const completionTokens = 250;

  await guardrail.auditor.audit({
    promptTokens,
    completionTokens,
    reason: "agent-run",
  });
}
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
npm run example
```

The example:
- initializes a local budget wallet
- enforces loop guard
- records audited usage
