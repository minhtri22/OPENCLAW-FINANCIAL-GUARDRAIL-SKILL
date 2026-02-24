export declare class AsyncMutex {
    private queue;
    private locked;
    runExclusive<T>(fn: () => Promise<T>): Promise<T>;
    private acquire;
    private release;
}
