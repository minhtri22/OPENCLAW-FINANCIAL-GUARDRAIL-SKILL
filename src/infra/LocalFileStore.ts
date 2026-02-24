import { promises as fs } from "fs";
import path from "path";

export class LocalFileStore {
  constructor(private readonly baseDir: string) {}

  private resolve(file: string): string {
    return path.join(this.baseDir, file);
  }

  async readJson<T>(file: string, fallback: T): Promise<T> {
    try {
      const raw = await fs.readFile(this.resolve(file), "utf-8");
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  }

  async writeJson<T>(file: string, data: T): Promise<void> {
    await fs.mkdir(this.baseDir, { recursive: true });
    const temp = this.resolve(`${file}.tmp`);
    await fs.writeFile(temp, JSON.stringify(data, null, 2), "utf-8");
    await fs.rename(temp, this.resolve(file));
  }

  async appendJsonLine(file: string, line: unknown): Promise<void> {
    await fs.mkdir(this.baseDir, { recursive: true });
    const payload = JSON.stringify(line);
    await fs.appendFile(this.resolve(file), payload + "\n", "utf-8");
  }
}
