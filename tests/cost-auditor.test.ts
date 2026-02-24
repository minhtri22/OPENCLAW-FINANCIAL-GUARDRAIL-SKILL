import { describe, expect, it } from "vitest";
import { CostAuditor } from "../src/core/engine/CostAuditor";
import { LocalFileStore } from "../src/infra/LocalFileStore";
import path from "path";
import { promises as fs } from "fs";

const tmpDir = path.join(process.cwd(), ".tmp-cost-tests");

async function reset() {
  await fs.rm(tmpDir, { recursive: true, force: true });
}

describe("Byzantine Worker Test", () => {
  it("ignores reported cost and calculates cost from tokens", async () => {
    await reset();
    const store = new LocalFileStore(tmpDir);
    const auditor = new CostAuditor(store);

    const entry = await auditor.audit({
      promptTokens: 1000,
      completionTokens: 500,
      reportedCost: 0.0001,
      reason: "byzantine",
    });

    expect(entry.estimatedCost).toBeGreaterThan(0);
    expect(entry.tokensUsed).toBe(1500);
  });

  it("detects cost spike and trips circuit", async () => {
    await reset();
    const store = new LocalFileStore(tmpDir);
    const auditor = new CostAuditor(store);

    for (let i = 0; i < 5; i++) {
      await auditor.audit({
        promptTokens: 100,
        completionTokens: 100,
        reason: "baseline",
      });
    }

    await expect(
      auditor.audit({
        promptTokens: 100000,
        completionTokens: 100000,
        reason: "spike",
      })
    ).rejects.toThrow("spike");
  });
});
