"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.guardrailConfig = exports.KeyVault = exports.UsageMeter = exports.LocalFileStore = exports.CostAuditor = exports.LoopGuard = exports.BudgetManager = void 0;
exports.createGuardrail = createGuardrail;
const BudgetManager_1 = require("./core/engine/BudgetManager");
Object.defineProperty(exports, "BudgetManager", { enumerable: true, get: function () { return BudgetManager_1.BudgetManager; } });
const LoopGuard_1 = require("./core/engine/LoopGuard");
Object.defineProperty(exports, "LoopGuard", { enumerable: true, get: function () { return LoopGuard_1.LoopGuard; } });
const CostAuditor_1 = require("./core/engine/CostAuditor");
Object.defineProperty(exports, "CostAuditor", { enumerable: true, get: function () { return CostAuditor_1.CostAuditor; } });
const LocalFileStore_1 = require("./infra/LocalFileStore");
Object.defineProperty(exports, "LocalFileStore", { enumerable: true, get: function () { return LocalFileStore_1.LocalFileStore; } });
const UsageMeter_1 = require("./infra/UsageMeter");
Object.defineProperty(exports, "UsageMeter", { enumerable: true, get: function () { return UsageMeter_1.UsageMeter; } });
const KeyVault_1 = require("./infra/KeyVault");
Object.defineProperty(exports, "KeyVault", { enumerable: true, get: function () { return KeyVault_1.KeyVault; } });
const guardrail_config_1 = require("./config/guardrail.config");
Object.defineProperty(exports, "guardrailConfig", { enumerable: true, get: function () { return guardrail_config_1.guardrailConfig; } });
function createGuardrail(baseDir, encryptionKey) {
    const store = new LocalFileStore_1.LocalFileStore(baseDir);
    const meter = new UsageMeter_1.UsageMeter(store);
    const auditor = new CostAuditor_1.CostAuditor(store, meter);
    const budget = new BudgetManager_1.BudgetManager(store);
    const loop = new LoopGuard_1.LoopGuard(store);
    const vault = new KeyVault_1.KeyVault(encryptionKey);
    return { store, meter, auditor, budget, loop, vault };
}
