import { randomUUID } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { z } from "zod";
import {
  normalizeError,
  UnauthorizedError,
  ValidationError,
  type ApiResponse,
  type ErrorFieldMap,
} from "@/lib/errors";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { enforceRateLimit } from "@/server/repositories";
import type { Database } from "@/types/database.types";

export interface AuthenticatedContext {
  supabase: SupabaseClient<Database>;
  userId: string;
  requestId: string;
}

export function parseWithZod<T extends z.ZodTypeAny>(schema: T, raw: unknown): z.infer<T> {
  const result = schema.safeParse(raw);
  if (!result.success) {
    const fieldErrors: ErrorFieldMap = {};
    for (const issue of result.error.issues) {
      const key = issue.path.join(".") || "root";
      const list = fieldErrors[key] ?? [];
      list.push(issue.message);
      fieldErrors[key] = list;
    }
    throw new ValidationError(result.error.issues[0]?.message ?? "Invalid input.", fieldErrors);
  }
  return result.data;
}

export async function requireAuthenticatedContext(): Promise<AuthenticatedContext> {
  const requestId = randomUUID();
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new UnauthorizedError("Please sign in to continue.");
  }

  await enforceRateLimit(supabase, `action:${user.id}`, 60, 60);

  return {
    supabase,
    userId: user.id,
    requestId,
  };
}

export async function executeServerAction<T>(
  handler: (requestId: string) => Promise<T>,
): Promise<ApiResponse<T>> {
  const requestId = randomUUID();
  try {
    const data = await handler(requestId);
    return {
      success: true,
      data,
      requestId,
    };
  } catch (error) {
    const normalized = normalizeError(error);
    return {
      success: false,
      error: normalized.body,
      requestId,
    };
  }
}
