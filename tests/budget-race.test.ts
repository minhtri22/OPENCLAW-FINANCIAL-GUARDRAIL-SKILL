import { describe, expect, it } from "vitest";
import { BudgetManager } from "../src/core/engine/BudgetManager";
import { LocalFileStore } from "../src/infra/LocalFileStore";
import path from "path";
import { promises as fs } from "fs";

const tmpDir = path.join(process.cwd(), ".tmp-guardrail-tests");

async function reset() {
  await fs.rm(tmpDir, { recursive: true, force: true });
}

describe("Budget Race Test", () => {
  it("allows only one worker to spend when budget is tight", async () => {
    await reset();
    const store = new LocalFileStore(tmpDir);
    const manager = new BudgetManager(store, () => new Date("2026-02-24T00:00:00Z"));

    await manager.init({
      totalCapital: 10,
      maxDailyBurn: 10,
      reserveCapital: 3,
      currentDailySpend: 0,
      lastSpendDate: "2026-02-24",
    });

    const workers = Array.from({ length: 10 }, () => manager.spend(7, "race"));
    const results = await Promise.all(workers);
    const successes = results.filter(Boolean).length;
    const state = await manager.getState();

    expect(successes).toBe(1);
    expect(state.currentDailySpend).toBe(7);
  });
});
