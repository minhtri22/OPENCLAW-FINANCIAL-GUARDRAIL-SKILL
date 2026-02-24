"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AsyncMutex = void 0;
class AsyncMutex {
    queue = [];
    locked = false;
    async runExclusive(fn) {
        await this.acquire();
        try {
            return await fn();
        }
        finally {
            this.release();
        }
    }
    acquire() {
        if (!this.locked) {
            this.locked = true;
            return Promise.resolve();
        }
        return new Promise((resolve) => {
            this.queue.push(resolve);
        });
    }
    release() {
        const next = this.queue.shift();
        if (next) {
            next();
            return;
        }
        this.locked = false;
    }
}
exports.AsyncMutex = AsyncMutex;
