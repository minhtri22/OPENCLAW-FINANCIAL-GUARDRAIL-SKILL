export declare class KeyVault {
    private readonly key;
    constructor(key: string);
    encrypt(plaintext: string): string;
    decrypt(payload: string): string;
    private keyBuffer;
}
