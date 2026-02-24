export interface GuardrailConfig {
    minReserveRatio: number;
    maxExecutionPerDay: number;
    cooldownWindowMinutes: number;
    deltaThreshold: number;
    tokenPricePer1k: number;
    costSpikeMultiplier: number;
    costHistoryWindow: number;
    forbiddenAuthorityKeys: string[];
}
export declare const guardrailConfig: GuardrailConfig;
