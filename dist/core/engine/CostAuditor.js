"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CostAuditor = void 0;
const guardrail_config_1 = require("../../config/guardrail.config");
class CostAuditor {
    store;
    meter;
    historyFile = "cost_history.json";
    constructor(store, meter) {
        this.store = store;
        this.meter = meter;
    }
    async audit(input) {
        const tokensUsed = Math.max(0, input.promptTokens + input.completionTokens);
        const estimatedCost = (tokensUsed / 1000) * guardrail_config_1.guardrailConfig.tokenPricePer1k;
        const history = await this.store.readJson(this.historyFile, []);
        const avg = history.length > 0 ? history.reduce((sum, c) => sum + c, 0) / history.length : estimatedCost;
        const spike = avg > 0 && estimatedCost > avg * guardrail_config_1.guardrailConfig.costSpikeMultiplier;
        if (spike) {
            throw new Error("CostAuditor: cost spike detected");
        }
        const entry = {
            timestamp: Date.now(),
            tokensUsed,
            estimatedCost,
            reason: input.reason,
        };
        history.push(estimatedCost);
        const trimmed = history.slice(-guardrail_config_1.guardrailConfig.costHistoryWindow);
        await this.store.writeJson(this.historyFile, trimmed);
        await this.meter.record(entry);
        return entry;
    }
    assertAuthorityChange(payload) {
        const keys = Object.keys(payload);
        for (const key of keys) {
            if (guardrail_config_1.guardrailConfig.forbiddenAuthorityKeys.includes(key)) {
                throw new Error(`CostAuditor: forbidden authority change on ${key}`);
            }
        }
    }
}
exports.CostAuditor = CostAuditor;
