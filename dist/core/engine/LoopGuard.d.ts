import { LocalFileStore } from "../../infra/LocalFileStore";
export declare class LoopGuard {
    private readonly store;
    private readonly now;
    private readonly stateFile;
    constructor(store: LocalFileStore, now?: () => Date);
    assertExecution(taskId: string, newScore: number): Promise<void>;
    private loadState;
    private saveState;
    private dateKey;
}
