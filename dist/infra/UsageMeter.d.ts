import { LocalFileStore } from "./LocalFileStore";
import { UsageEntry } from "../core/domain/Types";
export declare class UsageMeter {
    private readonly store;
    private readonly ledgerFile;
    constructor(store: LocalFileStore);
    record(entry: UsageEntry): Promise<void>;
}
