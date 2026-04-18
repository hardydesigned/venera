import { z } from "zod";
import type { Doc } from "../../_generated/dataModel";

export type TelegramSettings = Doc<"telegramSettings">;

export const telegramSettingsSchema = z.object({
  botToken: z.string().min(10, "Bot Token ist erforderlich (mind. 10 Zeichen)"),
  authorizedChatId: z.string().min(1, "Chat ID ist erforderlich"),
});

export type TelegramSettingsData = z.infer<typeof telegramSettingsSchema>;

export const defaultTelegramSettings: TelegramSettingsData = {
  botToken: "",
  authorizedChatId: "",
};
