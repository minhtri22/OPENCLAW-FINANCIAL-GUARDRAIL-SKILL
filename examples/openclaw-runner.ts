import path from "path";
import { createGuardrail } from "../dist";

async function run() {
  const guardrail = createGuardrail(path.join(process.cwd(), "runtime-data"), process.env.GUARDRAIL_KEY || "32-bytes-minimum-key__________");

  await guardrail.budget.init({
    totalCapital: 250,
    maxDailyBurn: 80,
    reserveCapital: 75,
    currentDailySpend: 0,
    lastSpendDate: new Date().toISOString().slice(0, 10),
  });

  const taskId = "openclaw-task-001";
  const newScore = 0.62;

  await guardrail.loop.assertExecution(taskId, newScore);

  const spendOk = await guardrail.budget.spend(15, "agent-run");
  if (!spendOk) {
    throw new Error("Budget exceeded or reserve breached");
  }

  const usage = await guardrail.auditor.audit({
    promptTokens: 900,
    completionTokens: 300,
    reason: "openclaw-agent-output",
  });

  console.log("Usage logged", usage);
}

run().catch((err) => {
  console.error("Guardrail blocked run:", err.message);
  process.exit(1);
});
