import { BudgetManager } from "./core/engine/BudgetManager";
import { LoopGuard } from "./core/engine/LoopGuard";
import { CostAuditor } from "./core/engine/CostAuditor";
import { LocalFileStore } from "./infra/LocalFileStore";
import { UsageMeter } from "./infra/UsageMeter";
import { KeyVault } from "./infra/KeyVault";
import { guardrailConfig } from "./config/guardrail.config";
export { BudgetManager, LoopGuard, CostAuditor, LocalFileStore, UsageMeter, KeyVault, guardrailConfig };
export declare function createGuardrail(baseDir: string, encryptionKey: string): {
    store: LocalFileStore;
    meter: UsageMeter;
    auditor: CostAuditor;
    budget: BudgetManager;
    loop: LoopGuard;
    vault: KeyVault;
};
