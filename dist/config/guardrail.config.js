"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.guardrailConfig = void 0;
exports.guardrailConfig = {
    minReserveRatio: 0.3,
    maxExecutionPerDay: 10,
    cooldownWindowMinutes: 60,
    deltaThreshold: 0.1,
    tokenPricePer1k: 0.5,
    costSpikeMultiplier: 3,
    costHistoryWindow: 20,
    forbiddenAuthorityKeys: ["tier", "budget", "maxDailyBurn", "reserveCapital", "capital"],
};
