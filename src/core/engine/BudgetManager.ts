import { guardrailConfig } from "../../config/guardrail.config";
import { CapitalState } from "../domain/Types";
import { AsyncMutex } from "../../infra/AsyncMutex";
import { LocalFileStore } from "../../infra/LocalFileStore";

export class BudgetManager {
  private readonly stateFile = "capital_state.json";
  private readonly mutex = new AsyncMutex();

  constructor(private readonly store: LocalFileStore, private readonly now: () => Date = () => new Date()) {}

  async init(state: CapitalState): Promise<void> {
    await this.store.writeJson(this.stateFile, state);
  }

  async getState(): Promise<CapitalState> {
    return this.store.readJson(this.stateFile, this.defaultState());
  }

  async spend(amount: number, reason: string): Promise<boolean> {
    if (amount <= 0) return false;
    return this.mutex.runExclusive(async () => {
      const state = await this.getState();
      const normalized = this.resetIfNewDay(state);
      const reserveFloor = normalized.totalCapital * guardrailConfig.minReserveRatio;
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

  async refund(amount: number): Promise<void> {
    if (amount <= 0) return;
    await this.mutex.runExclusive(async () => {
      const state = await this.getState();
      state.currentDailySpend = Math.max(0, state.currentDailySpend - amount);
      await this.store.writeJson(this.stateFile, state);
    });
  }

  private resetIfNewDay(state: CapitalState): CapitalState {
    const today = this.dateKey(this.now());
    if (state.lastSpendDate !== today) {
      return { ...state, currentDailySpend: 0, lastSpendDate: today };
    }
    return state;
  }

  private dateKey(date: Date): string {
    return date.toISOString().slice(0, 10);
  }

  private defaultState(): CapitalState {
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
