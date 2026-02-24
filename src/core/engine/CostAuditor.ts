import { guardrailConfig } from "../../config/guardrail.config";
import { UsageEntry } from "../domain/Types";
import { LocalFileStore } from "../../infra/LocalFileStore";
import { UsageMeter } from "../../infra/UsageMeter";

interface AuditInput {
  promptTokens: number;
  completionTokens: number;
  reportedCost?: number;
  reason: string;
}

export class CostAuditor {
  private readonly historyFile = "cost_history.json";

  constructor(private readonly store: LocalFileStore, private readonly meter: UsageMeter) {}

  async audit(input: AuditInput): Promise<UsageEntry> {
    const tokensUsed = Math.max(0, input.promptTokens + input.completionTokens);
    const estimatedCost = (tokensUsed / 1000) * guardrailConfig.tokenPricePer1k;

    const history = await this.store.readJson<number[]>(this.historyFile, []);
    const avg = history.length > 0 ? history.reduce((sum, c) => sum + c, 0) / history.length : estimatedCost;
    const spike = avg > 0 && estimatedCost > avg * guardrailConfig.costSpikeMultiplier;

    if (spike) {
      throw new Error("CostAuditor: cost spike detected");
    }

    const entry: UsageEntry = {
      timestamp: Date.now(),
      tokensUsed,
      estimatedCost,
      reason: input.reason,
    };

    history.push(estimatedCost);
    const trimmed = history.slice(-guardrailConfig.costHistoryWindow);
    await this.store.writeJson(this.historyFile, trimmed);
    await this.meter.record(entry);

    return entry;
  }

  assertAuthorityChange(payload: Record<string, unknown>): void {
    const keys = Object.keys(payload);
    for (const key of keys) {
      if (guardrailConfig.forbiddenAuthorityKeys.includes(key)) {
        throw new Error(`CostAuditor: forbidden authority change on ${key}`);
      }
    }
  }
}
