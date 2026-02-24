import { LocalFileStore } from "./LocalFileStore";
import { UsageEntry } from "../core/domain/Types";

export interface UsageReporter {
  onRecord(entry: UsageEntry): void | Promise<void>;
}

export class ConsoleUsageReporter implements UsageReporter {
  onRecord(entry: UsageEntry): void {
    const payload = {
      timestamp: new Date(entry.timestamp).toISOString(),
      tokensUsed: entry.tokensUsed,
      estimatedCost: entry.estimatedCost,
      reason: entry.reason,
      model: entry.model ?? "unknown",
    };
    if (typeof console.table === "function") {
      console.table([payload]);
      return;
    }
    console.log("Usage:", payload);
  }
}

export class UsageMeter {
  private readonly ledgerFile = "usage_ledger.log";
  private readonly reporters: UsageReporter[] = [];

  constructor(private readonly store: LocalFileStore, reporters: UsageReporter[] = []) {
    this.reporters = [...reporters];
  }

  async record(entry: UsageEntry): Promise<void> {
    await this.store.appendJsonLine(this.ledgerFile, entry);
    for (const reporter of this.reporters) {
      await reporter.onRecord(entry);
    }
  }

  addReporter(reporter: UsageReporter): void {
    this.reporters.push(reporter);
  }

  async readLedger(): Promise<UsageEntry[]> {
    return this.store.readJsonLines<UsageEntry>(this.ledgerFile);
  }
}
