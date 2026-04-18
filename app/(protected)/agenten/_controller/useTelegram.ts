"use client";

import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { TelegramSettingsData } from "@/convex/telegram/_model/telegram";

export function useTelegram() {
  const settings = useQuery(api.telegram.bot.queries.getMine);
  const upsertMutation = useMutation(api.telegram.bot.mutations.upsertSettings);
  const removeMutation = useMutation(api.telegram.bot.mutations.removeSettings);
  const registerAction = useAction(api.telegram.bot.actions.registerWebhook);
  const removeWebhookAction = useAction(api.telegram.bot.actions.removeWebhook);

  const save = async (
    data: TelegramSettingsData,
  ): Promise<{ error: Error | null }> => {
    try {
      await upsertMutation(data);
      return { error: null };
    } catch (e) {
      return { error: e as Error };
    }
  };

  const remove = async (): Promise<{ error: Error | null }> => {
    try {
      await removeMutation({});
      return { error: null };
    } catch (e) {
      return { error: e as Error };
    }
  };

  const registerWebhook = async (): Promise<{
    success: boolean;
    error?: string;
  }> => {
    try {
      return await registerAction({});
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  };

  const removeWebhook = async (): Promise<{
    success: boolean;
    error?: string;
  }> => {
    try {
      return await removeWebhookAction({});
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  };

  return {
    settings: settings ?? null,
    isLoading: settings === undefined,
    save,
    remove,
    registerWebhook,
    removeWebhook,
  };
}
