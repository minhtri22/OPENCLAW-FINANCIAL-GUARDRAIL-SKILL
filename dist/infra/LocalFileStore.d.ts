export declare class LocalFileStore {
    private readonly baseDir;
    constructor(baseDir: string);
    private resolve;
    readJson<T>(file: string, fallback: T): Promise<T>;
    writeJson<T>(file: string, data: T): Promise<void>;
    appendJsonLine(file: string, line: unknown): Promise<void>;
}
