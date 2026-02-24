import { guardrailConfig } from "../../config/guardrail.config";
import { LoopState } from "../domain/Types";
import { LocalFileStore } from "../../infra/LocalFileStore";

export class LoopGuard {
  private readonly stateFile = "loop_state.json";

  constructor(private readonly store: LocalFileStore, private readonly now: () => Date = () => new Date()) {}

  async assertExecution(taskId: string, newScore: number): Promise<void> {
    const state = await this.loadState(taskId);
    const today = this.dateKey(this.now());
    const minutesSince = state.lastExecutedAt ? (this.now().getTime() - state.lastExecutedAt) / 60000 : Infinity;
    const delta = state.lastScore === 0 ? 1 : Math.abs(newScore - state.lastScore) / Math.max(1e-6, Math.abs(state.lastScore));

    if (state.lastExecutionDate !== today) {
      state.executionsToday = 0;
    }

    if (state.executionsToday >= guardrailConfig.maxExecutionPerDay) {
      throw new Error("LoopGuard: maxExecutionPerDay reached");
    }

    if (minutesSince < guardrailConfig.cooldownWindowMinutes) {
      throw new Error("LoopGuard: cooldown window active");
    }

    if (delta < guardrailConfig.deltaThreshold) {
      throw new Error("LoopGuard: deltaThreshold not met");
    }

    const updated: LoopState = {
      taskId,
      lastScore: newScore,
      lastExecutedAt: this.now().getTime(),
      executionsToday: state.lastExecutionDate === today ? state.executionsToday + 1 : 1,
      lastExecutionDate: today,
    };
    await this.saveState(taskId, updated);
  }

  private async loadState(taskId: string): Promise<LoopState> {
    const all = await this.store.readJson<Record<string, LoopState>>(this.stateFile, {});
    return all[taskId] ?? {
      taskId,
      lastScore: 0,
      lastExecutedAt: 0,
      executionsToday: 0,
      lastExecutionDate: "",
    };
  }

  private async saveState(taskId: string, state: LoopState): Promise<void> {
    const all = await this.store.readJson<Record<string, LoopState>>(this.stateFile, {});
    all[taskId] = state;
    await this.store.writeJson(this.stateFile, all);
  }

  private dateKey(date: Date): string {
    return date.toISOString().slice(0, 10);
  }
}
