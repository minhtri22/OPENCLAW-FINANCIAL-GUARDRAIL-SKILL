import { BudgetManager } from "./BudgetManager";
import { LoopGuard } from "./LoopGuard";
import { CostAuditor } from "./CostAuditor";
import { UsageMeter } from "../../infra/UsageMeter";
import { LogEvent } from "../domain/Types";

export interface GuardrailBundle {
  budget: BudgetManager;
  loop: LoopGuard;
  auditor: CostAuditor;
  meter: UsageMeter;
}

export interface LlmUsage {
  promptTokens: number;
  completionTokens: number;
  model?: string;
}

export interface GuardedCallInput<T> {
  taskId: string;
  requestId: string;
  environment: string;
  signal: number;
  spend: number;
  reason: string;
  model?: string;
  execute: () => Promise<{ result: T; usage: LlmUsage }>;
}

export async function guardLlmCall<T>(
  guardrail: GuardrailBundle,
  input: GuardedCallInput<T>
): Promise<T> {
  const start = Date.now();
  const allow = await guardrail.budget.spend(input.spend, input.reason);
  if (!allow) {
    const blockedEvent: LogEvent = {
      requestId: input.requestId,
      model: input.model ?? "unknown",
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
      cost: 0,
      latencyMs: Date.now() - start,
      environment: input.environment,
      blocked: true,
      blockReason: "budget limit hit",
      timestamp: Date.now(),
    };
    await guardrail.meter.record(blockedEvent);
    throw new Error("Guardrail: budget limit hit");
  }

  await guardrail.loop.assertExecution(input.taskId, input.signal);

  const { result, usage } = await input.execute();

  const audit = await guardrail.auditor.audit({
    promptTokens: usage.promptTokens,
    completionTokens: usage.completionTokens,
    model: usage.model ?? input.model,
    reason: input.reason,
  });

  const latency = Date.now() - start;
  const logEvent: LogEvent = {
    requestId: input.requestId,
    model: usage.model ?? input.model ?? "unknown",
    promptTokens: usage.promptTokens,
    completionTokens: usage.completionTokens,
    totalTokens: usage.promptTokens + usage.completionTokens,
    cost: audit.estimatedCost,
    latencyMs: latency,
    environment: input.environment,
    blocked: false,
    timestamp: Date.now(),
  };
  await guardrail.meter.record(logEvent);

  return result;
}

export function wrapLlmCaller(guardrail: GuardrailBundle) {
  return async function guardedCall<T>(
    input: GuardedCallInput<T>
  ): Promise<T> {
    return guardLlmCall(guardrail, input);
  };
}
