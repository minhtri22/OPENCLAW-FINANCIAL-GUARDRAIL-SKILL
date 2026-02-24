"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalFileStore = void 0;
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
class LocalFileStore {
    baseDir;
    constructor(baseDir) {
        this.baseDir = baseDir;
    }
    resolve(file) {
        return path_1.default.join(this.baseDir, file);
    }
    async readJson(file, fallback) {
        try {
            const raw = await fs_1.promises.readFile(this.resolve(file), "utf-8");
            return JSON.parse(raw);
        }
        catch {
            return fallback;
        }
    }
    async writeJson(file, data) {
        await fs_1.promises.mkdir(this.baseDir, { recursive: true });
        const temp = this.resolve(`${file}.tmp`);
        await fs_1.promises.writeFile(temp, JSON.stringify(data, null, 2), "utf-8");
        await fs_1.promises.rename(temp, this.resolve(file));
    }
    async appendJsonLine(file, line) {
        await fs_1.promises.mkdir(this.baseDir, { recursive: true });
        const payload = JSON.stringify(line);
        await fs_1.promises.appendFile(this.resolve(file), payload + "\n", "utf-8");
    }
}
exports.LocalFileStore = LocalFileStore;
