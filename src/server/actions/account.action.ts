"use server";

import { revalidatePath } from "next/cache";
import { logEvent } from "@/lib/logger";
import type { ApiResponse } from "@/lib/errors";
import {
  deleteUserAccountSchema,
  updateAccountPreferencesSchema,
  type DeleteUserAccountInput,
  type UpdateAccountPreferencesInput,
} from "@/lib/schemas";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { deleteUserRow, updateUserPreferences } from "@/server/repositories";
import { executeServerAction, parseWithZod, requireAuthenticatedContext } from "./action-utils";

export async function signOutAction(): Promise<ApiResponse<{ redirectTo: string }>> {
  return executeServerAction(async () => {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
    return { redirectTo: "/login" };
  });
}

export async function updateAccountPreferencesAction(
  input: UpdateAccountPreferencesInput,
): Promise<ApiResponse<{ id: string; gmailScanEnabled: boolean; lastGmailScanAt: string | null }>> {
  return executeServerAction(async () => {
    const parsed = parseWithZod(updateAccountPreferencesSchema, input);
    const { supabase, userId } = await requireAuthenticatedContext();

    const updated = await updateUserPreferences(supabase, userId, parsed.gmailScanEnabled);
    revalidatePath("/profiles");

    logEvent("info", {
      service: "account",
      event: "account_preferences_updated",
      userId,
      meta: { gmailScanEnabled: updated.gmailScanEnabled },
    });

    return {
      id: updated.id,
      gmailScanEnabled: updated.gmailScanEnabled,
      lastGmailScanAt: updated.lastGmailScanAt,
    };
  });
}

export async function deleteUserAccountAction(
  input: DeleteUserAccountInput,
): Promise<ApiResponse<{ deleted: true }>> {
  return executeServerAction(async () => {
    parseWithZod(deleteUserAccountSchema, input);
    const { supabase, userId } = await requireAuthenticatedContext();

    // Purge user's Storage objects under {userId}/ via user-scoped RLS policy
    const { data: folders } = await supabase.storage.from("vault-files").list(userId, {
      limit: 1000,
    });

    if (folders && folders.length > 0) {
      const objectPaths: string[] = [];
      for (const entry of folders) {
        const prefix = `${userId}/${entry.name}`;
        const { data: nestedFiles } = await supabase.storage.from("vault-files").list(prefix, {
          limit: 100,
        });
        if (nestedFiles && nestedFiles.length > 0) {
          for (const file of nestedFiles) {
            objectPaths.push(`${prefix}/${file.name}`);
          }
        } else if (entry.id) {
          objectPaths.push(prefix);
        }
      }
      if (objectPaths.length > 0) {
        await supabase.storage.from("vault-files").remove(objectPaths);
      }
    }

    await deleteUserRow(supabase, userId);
    await supabase.auth.signOut();

    logEvent("info", {
      service: "account",
      event: "user_account_deleted",
      userId,
    });

    return { deleted: true };
  });
}
