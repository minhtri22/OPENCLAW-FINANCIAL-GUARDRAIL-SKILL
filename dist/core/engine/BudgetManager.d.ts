import { CapitalState } from "../domain/Types";
import { LocalFileStore } from "../../infra/LocalFileStore";
export declare class BudgetManager {
    private readonly store;
    private readonly now;
    private readonly stateFile;
    private readonly mutex;
    constructor(store: LocalFileStore, now?: () => Date);
    init(state: CapitalState): Promise<void>;
    getState(): Promise<CapitalState>;
    spend(amount: number, reason: string): Promise<boolean>;
    refund(amount: number): Promise<void>;
    private resetIfNewDay;
    private dateKey;
    private defaultState;
}
