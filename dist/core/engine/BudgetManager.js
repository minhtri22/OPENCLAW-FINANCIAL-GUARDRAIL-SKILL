"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BudgetManager = void 0;
const guardrail_config_1 = require("../../config/guardrail.config");
const AsyncMutex_1 = require("../../infra/AsyncMutex");
class BudgetManager {
    store;
    now;
    stateFile = "capital_state.json";
    mutex = new AsyncMutex_1.AsyncMutex();
    constructor(store, now = () => new Date()) {
        this.store = store;
        this.now = now;
    }
    async init(state) {
        await this.store.writeJson(this.stateFile, state);
    }
    async getState() {
        return this.store.readJson(this.stateFile, this.defaultState());
    }
    async spend(amount, reason) {
        if (amount <= 0)
            return false;
        return this.mutex.runExclusive(async () => {
            const state = await this.getState();
            const normalized = this.resetIfNewDay(state);
            const reserveFloor = normalized.totalCapital * guardrail_config_1.guardrailConfig.minReserveRatio;
            const availableAfterSpend = normalized.totalCapital - (normalized.currentDailySpend + amount);
            if (normalized.currentDailySpend + amount > normalized.maxDailyBurn) {
                return false;
            }
            if (availableAfterSpend < reserveFloor || availableAfterSpend < normalized.reserveCapital) {
                return false;
            }
            normalized.currentDailySpend += amount;
            await this.store.writeJson(this.stateFile, normalized);
            return true;
        });
    }
    async refund(amount) {
        if (amount <= 0)
            return;
        await this.mutex.runExclusive(async () => {
            const state = await this.getState();
            state.currentDailySpend = Math.max(0, state.currentDailySpend - amount);
            await this.store.writeJson(this.stateFile, state);
        });
    }
    resetIfNewDay(state) {
        const today = this.dateKey(this.now());
        if (state.lastSpendDate !== today) {
            return { ...state, currentDailySpend: 0, lastSpendDate: today };
        }
        return state;
    }
    dateKey(date) {
        return date.toISOString().slice(0, 10);
    }
    defaultState() {
        const today = this.dateKey(this.now());
        return {
            totalCapital: 0,
            maxDailyBurn: 0,
            reserveCapital: 0,
            currentDailySpend: 0,
            lastSpendDate: today,
        };
    }
}
exports.BudgetManager = BudgetManager;
