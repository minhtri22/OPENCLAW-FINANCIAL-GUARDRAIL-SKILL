"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoopGuard = void 0;
const guardrail_config_1 = require("../../config/guardrail.config");
class LoopGuard {
    store;
    now;
    stateFile = "loop_state.json";
    constructor(store, now = () => new Date()) {
        this.store = store;
        this.now = now;
    }
    async assertExecution(taskId, newScore) {
        const state = await this.loadState(taskId);
        const today = this.dateKey(this.now());
        const minutesSince = state.lastExecutedAt ? (this.now().getTime() - state.lastExecutedAt) / 60000 : Infinity;
        const delta = state.lastScore === 0 ? 1 : Math.abs(newScore - state.lastScore) / Math.max(1e-6, Math.abs(state.lastScore));
        if (state.lastExecutionDate !== today) {
            state.executionsToday = 0;
        }
        if (state.executionsToday >= guardrail_config_1.guardrailConfig.maxExecutionPerDay) {
            throw new Error("LoopGuard: maxExecutionPerDay reached");
        }
        if (minutesSince < guardrail_config_1.guardrailConfig.cooldownWindowMinutes) {
            throw new Error("LoopGuard: cooldown window active");
        }
        if (delta < guardrail_config_1.guardrailConfig.deltaThreshold) {
            throw new Error("LoopGuard: deltaThreshold not met");
        }
        const updated = {
            taskId,
            lastScore: newScore,
            lastExecutedAt: this.now().getTime(),
            executionsToday: state.lastExecutionDate === today ? state.executionsToday + 1 : 1,
            lastExecutionDate: today,
        };
        await this.saveState(taskId, updated);
    }
    async loadState(taskId) {
        const all = await this.store.readJson(this.stateFile, {});
        return all[taskId] ?? {
            taskId,
            lastScore: 0,
            lastExecutedAt: 0,
            executionsToday: 0,
            lastExecutionDate: "",
        };
    }
    async saveState(taskId, state) {
        const all = await this.store.readJson(this.stateFile, {});
        all[taskId] = state;
        await this.store.writeJson(this.stateFile, all);
    }
    dateKey(date) {
        return date.toISOString().slice(0, 10);
    }
}
exports.LoopGuard = LoopGuard;
