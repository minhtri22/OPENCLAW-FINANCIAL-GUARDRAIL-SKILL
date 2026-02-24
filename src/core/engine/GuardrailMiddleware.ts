import { BudgetManager } from "./BudgetManager";
import { LoopGuard } from "./LoopGuard";
import { CostAuditor } from "./CostAuditor";

export interface GuardrailBundle {
  budget: BudgetManager;
  loop: LoopGuard;
  auditor: CostAuditor;
}

export interface LlmUsage {
  promptTokens: number;
  completionTokens: number;
  model?: string;
}

export interface GuardedCallInput<T> {
  taskId: string;
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
  const allowed = await guardrail.budget.spend(input.spend, input.reason);
  if (!allowed) {
    throw new Error("Guardrail: budget limit hit");
  }

  await guardrail.loop.assertExecution(input.taskId, input.signal);

  const { result, usage } = await input.execute();

  await guardrail.auditor.audit({
    promptTokens: usage.promptTokens,
    completionTokens: usage.completionTokens,
    model: usage.model ?? input.model,
    reason: input.reason,
  });

  return result;
}

export function wrapLlmCaller(guardrail: GuardrailBundle) {
  return async function guardedCall<T>(
    input: GuardedCallInput<T>
  ): Promise<T> {
    return guardLlmCall(guardrail, input);
  };
}
