"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsageMeter = void 0;
class UsageMeter {
    store;
    ledgerFile = "usage_ledger.log";
    constructor(store) {
        this.store = store;
    }
    async record(entry) {
        await this.store.appendJsonLine(this.ledgerFile, entry);
    }
}
exports.UsageMeter = UsageMeter;
