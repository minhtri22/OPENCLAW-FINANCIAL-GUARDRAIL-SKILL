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

export const guardrailConfig: GuardrailConfig = {
  minReserveRatio: 0.3,
  maxExecutionPerDay: 10,
  cooldownWindowMinutes: 60,
  deltaThreshold: 0.1,
  tokenPricePer1k: 0.5,
  costSpikeMultiplier: 3,
  costHistoryWindow: 20,
  forbiddenAuthorityKeys: ["tier", "budget", "maxDailyBurn", "reserveCapital", "capital"],
};
