"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KeyVault = void 0;
const crypto_1 = __importDefault(require("crypto"));
class KeyVault {
    key;
    constructor(key) {
        this.key = key;
        if (!key || Buffer.from(key).length < 32) {
            throw new Error("Encryption key must be at least 32 bytes");
        }
    }
    encrypt(plaintext) {
        const iv = crypto_1.default.randomBytes(16);
        const cipher = crypto_1.default.createCipheriv("aes-256-gcm", this.keyBuffer(), iv);
        const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
        const tag = cipher.getAuthTag();
        return Buffer.concat([iv, tag, encrypted]).toString("base64");
    }
    decrypt(payload) {
        const raw = Buffer.from(payload, "base64");
        const iv = raw.subarray(0, 16);
        const tag = raw.subarray(16, 32);
        const data = raw.subarray(32);
        const decipher = crypto_1.default.createDecipheriv("aes-256-gcm", this.keyBuffer(), iv);
        decipher.setAuthTag(tag);
        return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
    }
    keyBuffer() {
        const buf = Buffer.alloc(32);
        Buffer.from(this.key).copy(buf);
        return buf;
    }
}
exports.KeyVault = KeyVault;
