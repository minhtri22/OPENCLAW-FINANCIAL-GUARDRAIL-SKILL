import path from "path";
import { ConsoleUsageReporter, createGuardrail, guardLlmCall } from "../dist";

async function run() {
  const guardrail = createGuardrail(
    path.join(process.cwd(), "runtime-data"),
    process.env.GUARDRAIL_KEY || "0123456789abcdef0123456789abcdef"
  );

  await guardrail.budget.init({
    totalCapital: 250,
    maxDailyBurn: 80,
    reserveCapital: 75,
    currentDailySpend: 0,
    lastSpendDate: new Date().toISOString().slice(0, 10),
  });

  const taskId = "openclaw-task-001";
  const newScore = 0.62;

  guardrail.meter.addReporter(new ConsoleUsageReporter());

  const result = await guardLlmCall(guardrail, {
    taskId,
    signal: newScore,
    spend: 15,
    reason: "openclaw-agent-output",
    model: "gpt-4o-mini",
    execute: async () => {
      return {
        result: { ok: true },
        usage: { promptTokens: 900, completionTokens: 300, model: "gpt-4o-mini" },
      };
    },
  });

  console.log("Runner result", result);
}

run().catch((err) => {
  console.error("Guardrail blocked run:", err.message);
  process.exit(1);
});
