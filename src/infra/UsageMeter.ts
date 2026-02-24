import { LocalFileStore } from "./LocalFileStore";
import { UsageEntry } from "../core/domain/Types";

export class UsageMeter {
  private readonly ledgerFile = "usage_ledger.log";

  constructor(private readonly store: LocalFileStore) {}

  async record(entry: UsageEntry): Promise<void> {
    await this.store.appendJsonLine(this.ledgerFile, entry);
  }
}
