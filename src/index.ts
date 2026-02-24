import { BudgetManager } from "./core/engine/BudgetManager";
import { LoopGuard } from "./core/engine/LoopGuard";
import { CostAuditor } from "./core/engine/CostAuditor";
import { guardLlmCall, wrapLlmCaller } from "./core/engine/GuardrailMiddleware";
import { LocalFileStore } from "./infra/LocalFileStore";
import { UsageMeter } from "./infra/UsageMeter";
import { KeyVault } from "./infra/KeyVault";
import { guardrailConfig } from "./config/guardrail.config";

export {
  BudgetManager,
  LoopGuard,
  CostAuditor,
  LocalFileStore,
  UsageMeter,
  KeyVault,
  guardrailConfig,
  guardLlmCall,
  wrapLlmCaller,
};

export function createGuardrail(baseDir: string, encryptionKey: string) {
  const store = new LocalFileStore(baseDir);
  const meter = new UsageMeter(store);
  const auditor = new CostAuditor(store);
  const budget = new BudgetManager(store);
  const loop = new LoopGuard(store);
  const vault = new KeyVault(encryptionKey);

  return { store, meter, auditor, budget, loop, vault };
}
