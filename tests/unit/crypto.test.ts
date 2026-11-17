import { describe, expect, it } from "vitest";
import { decryptSecret, encryptSecret, generateShareToken } from "@/lib/crypto";
import { getServerEnv } from "@/lib/env";

const TEST_HEX_SECRET = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

describe("crypto utilities", () => {
  it("encrypts and decrypts payloads using AES-256-GCM with unique IVs", () => {
    const plaintext = "1//0g-sample-google-refresh-token";
    const cipherOne = encryptSecret(plaintext, TEST_HEX_SECRET);
    const cipherTwo = encryptSecret(plaintext, TEST_HEX_SECRET);

    expect(cipherOne).not.toEqual(cipherTwo);
    expect(decryptSecret(cipherOne, TEST_HEX_SECRET)).toEqual(plaintext);
    expect(decryptSecret(cipherTwo, TEST_HEX_SECRET)).toEqual(plaintext);
  });

  it("rejects tampered ciphertext", () => {
    const encrypted = encryptSecret("sensitive-token", TEST_HEX_SECRET);
    const tampered = `${encrypted.slice(0, -2)}AA`;
    expect(() => decryptSecret(tampered, TEST_HEX_SECRET)).toThrow();
  });

  it("generates high-entropy 192-bit URL-safe share tokens", () => {
    const tokenA = generateShareToken();
    const tokenB = generateShareToken();

    expect(tokenA).toHaveLength(32);
    expect(tokenB).toHaveLength(32);
    expect(tokenA).not.toEqual(tokenB);
    expect(tokenA).toMatch(/^[A-Za-z0-9_-]{32}$/);
  });
});

describe("env validator", () => {
  it("fails fast with a clear Zod message when required variables are missing", () => {
    expect(() => getServerEnv()).toThrow(/Invalid MedBay server environment configuration/);
  });
});
