import { UsageEntry } from "../domain/Types";
import { LocalFileStore } from "../../infra/LocalFileStore";
import { UsageMeter } from "../../infra/UsageMeter";
interface AuditInput {
    promptTokens: number;
    completionTokens: number;
    reportedCost?: number;
    reason: string;
}
export declare class CostAuditor {
    private readonly store;
    private readonly meter;
    private readonly historyFile;
    constructor(store: LocalFileStore, meter: UsageMeter);
    audit(input: AuditInput): Promise<UsageEntry>;
    assertAuthorityChange(payload: Record<string, unknown>): void;
}
export {};
