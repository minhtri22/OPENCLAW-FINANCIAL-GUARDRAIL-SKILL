export interface CapitalState {
  totalCapital: number;
  maxDailyBurn: number;
  reserveCapital: number;
  currentDailySpend: number;
  lastSpendDate: string;
}

export interface UsageEntry {
  timestamp: number;
  tokensUsed: number;
  estimatedCost: number;
  reason: string;
  model?: string;
}

export interface LoopState {
  taskId: string;
  lastScore: number;
  lastExecutedAt: number;
  executionsToday: number;
  lastExecutionDate: string;
}

export interface LogEvent {
  requestId: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  cost: number;
  latencyMs: number;
  environment: string;
  blocked: boolean;
  blockReason?: string;
  timestamp: number;
}
