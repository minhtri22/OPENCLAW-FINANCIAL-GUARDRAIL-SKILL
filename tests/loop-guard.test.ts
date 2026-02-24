import { describe, expect, it } from "vitest";
import { LoopGuard } from "../src/core/engine/LoopGuard";
import { LocalFileStore } from "../src/infra/LocalFileStore";
import path from "path";
import { promises as fs } from "fs";

const tmpDir = path.join(process.cwd(), ".tmp-loop-tests");

async function reset() {
  await fs.rm(tmpDir, { recursive: true, force: true });
}

describe("Loop Protection Test", () => {
  it("blocks execution after max runs and cooldown not met", async () => {
    await reset();
    const store = new LocalFileStore(tmpDir);
    let now = new Date("2026-02-24T00:00:00Z");
    const guard = new LoopGuard(store, () => now);

    await guard.assertExecution("task-1", 100);

    now = new Date("2026-02-24T00:10:00Z");
    await expect(guard.assertExecution("task-1", 115)).rejects.toThrow("cooldown");

    now = new Date("2026-02-24T01:30:00Z");
    let score = 120;
    await guard.assertExecution("task-1", score);

    for (let i = 0; i < 8; i++) {
      now = new Date(`2026-02-24T${String(2 + i).padStart(2, "0")}:30:00Z`);
      score = Math.round(score * 1.2);
      await guard.assertExecution("task-1", score);
    }

    now = new Date("2026-02-24T23:30:00Z");
    await expect(guard.assertExecution("task-1", 999)).rejects.toThrow("maxExecutionPerDay");
  });
});
