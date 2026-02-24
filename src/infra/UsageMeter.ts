import { LocalFileStore } from "./LocalFileStore";
import { LogEvent } from "../core/domain/Types";

export class UsageMeter {
  private readonly ledgerFile = "usage_ledger.log";

  constructor(private readonly store: LocalFileStore) {}

  async record(event: LogEvent): Promise<void> {
    await this.store.appendJsonLine(this.ledgerFile, event);
  }
}
