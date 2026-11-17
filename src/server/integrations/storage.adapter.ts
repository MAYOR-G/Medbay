import type { SupabaseClient } from "@supabase/supabase-js";
import { ExternalProviderError } from "@/lib/errors";
import type { Database } from "@/types/database.types";

const VAULT_BUCKET = "vault-files";

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<never>((_resolve, reject) => {
        timer = setTimeout(
          () => reject(new ExternalProviderError(`${label} timed out.`)),
          timeoutMs,
        );
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export async function uploadVaultFile(
  client: SupabaseClient<Database>,
  storagePath: string,
  fileBuffer: Buffer,
  contentType: string,
): Promise<void> {
  const attemptUpload = async () => {
    const { error } = await withTimeout(
      client.storage.from(VAULT_BUCKET).upload(storagePath, fileBuffer, {
        contentType,
        upsert: false,
      }),
      30_000,
      "Vault storage upload",
    );
    if (error) {
      throw new ExternalProviderError(`Storage upload failed: ${error.message}`);
    }
  };

  try {
    await attemptUpload();
  } catch {
    await attemptUpload();
  }
}

export async function createSignedVaultUrl(
  client: SupabaseClient<Database>,
  storagePath: string,
  expiresInSeconds: number,
  downloadFilename?: string,
): Promise<string> {
  const { data, error } = await withTimeout(
    client.storage.from(VAULT_BUCKET).createSignedUrl(storagePath, expiresInSeconds, {
      ...(downloadFilename ? { download: downloadFilename } : {}),
    }),
    5_000,
    "Signed URL generation",
  );

  if (error || !data?.signedUrl) {
    throw new ExternalProviderError(
      `Failed to generate signed URL: ${error?.message ?? "unknown"}`,
    );
  }
  return data.signedUrl;
}

export async function downloadVaultFile(
  client: SupabaseClient<Database>,
  storagePath: string,
): Promise<Buffer> {
  const { data, error } = await withTimeout(
    client.storage.from(VAULT_BUCKET).download(storagePath),
    30_000,
    "Vault file download",
  );

  if (error || !data) {
    throw new ExternalProviderError(
      `Failed to download vault file: ${error?.message ?? "unknown"}`,
    );
  }

  const arrayBuffer = await data.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export async function deleteVaultFile(
  client: SupabaseClient<Database>,
  storagePath: string,
): Promise<void> {
  const { error } = await withTimeout(
    client.storage.from(VAULT_BUCKET).remove([storagePath]),
    10_000,
    "Vault file deletion",
  );

  if (error) {
    throw new ExternalProviderError(`Failed to delete vault file: ${error.message}`);
  }
}
