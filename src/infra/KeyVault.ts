import crypto from "crypto";

export class KeyVault {
  constructor(private readonly key: string) {
    if (!key || Buffer.from(key).length < 32) {
      throw new Error("Encryption key must be at least 32 bytes");
    }
  }

  encrypt(plaintext: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv("aes-256-gcm", this.keyBuffer(), iv);
    const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
    const tag = cipher.getAuthTag();
    return Buffer.concat([iv, tag, encrypted]).toString("base64");
  }

  decrypt(payload: string): string {
    const raw = Buffer.from(payload, "base64");
    const iv = raw.subarray(0, 16);
    const tag = raw.subarray(16, 32);
    const data = raw.subarray(32);
    const decipher = crypto.createDecipheriv("aes-256-gcm", this.keyBuffer(), iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
  }

  private keyBuffer(): Buffer {
    const buf = Buffer.alloc(32);
    Buffer.from(this.key).copy(buf);
    return buf;
  }
}
