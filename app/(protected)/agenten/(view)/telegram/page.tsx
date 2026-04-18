"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { ArrowLeft, Bot, CheckCircle } from "lucide-react";
import { useTelegram } from "../../_controller/useTelegram";
import {
  telegramSettingsSchema,
  type TelegramSettingsData,
  defaultTelegramSettings,
} from "@/convex/telegram/_model/telegram";

export default function TelegramSettingsPage() {
  const { settings, save, remove, registerWebhook, removeWebhook } =
    useTelegram();
  const [isSaving, setIsSaving] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const form = useForm<TelegramSettingsData>({
    resolver: zodResolver(telegramSettingsSchema),
    values: settings
      ? { botToken: settings.botToken, authorizedChatId: settings.authorizedChatId }
      : defaultTelegramSettings,
  });

  const handleSave = async (data: TelegramSettingsData) => {
    setIsSaving(true);
    const { error } = await save(data);
    setIsSaving(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Einstellungen gespeichert");
    }
  };

  const handleRegisterWebhook = async () => {
    setIsRegistering(true);
    const result = await registerWebhook();
    setIsRegistering(false);
    if (result.success) {
      toast.success("Webhook erfolgreich registriert");
    } else {
      toast.error("Fehler: " + (result.error ?? "Unbekannt"));
    }
  };

  const handleRemoveWebhook = async () => {
    setIsRegistering(true);
    const result = await removeWebhook();
    setIsRegistering(false);
    if (result.success) {
      toast.success("Webhook entfernt");
    } else {
      toast.error("Fehler: " + (result.error ?? "Unbekannt"));
    }
  };

  const handleRemove = async () => {
    const { error } = await remove();
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Bot-Verbindung entfernt");
      form.reset(defaultTelegramSettings);
    }
  };

  return (
    <section className="flex h-full flex-col gap-6 p-4">
      <div className="flex items-center gap-4">
        <Link href="/agenten">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1 space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">
            Telegram Bot
          </h1>
          <p className="text-sm text-muted-foreground">
            Steuere KI-Agenten direkt über Telegram
          </p>
        </div>
        {settings?.webhookRegistered && (
          <Badge variant="default">
            <CheckCircle className="mr-1 h-3 w-3" />
            Verbunden
          </Badge>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Setup-Anleitung
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            1. Erstelle einen Bot über <strong>@BotFather</strong> in Telegram
            und kopiere den Token.
          </p>
          <p>
            2. Sende eine Nachricht an deinen Bot, dann ermittle deine Chat-ID
            über <strong>@userinfobot</strong>.
          </p>
          <p>3. Speichere die Einstellungen und registriere den Webhook.</p>
          <p>
            4. Verfügbare Befehle:{" "}
            <code>/list</code>, <code>/run &lt;Name&gt;</code>,{" "}
            <code>/status</code>, <code>/help</code>
          </p>
        </CardContent>
      </Card>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bot-Konfiguration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="botToken"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bot Token *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
                        type="password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="authorizedChatId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Autorisierte Chat-ID *</FormLabel>
                    <FormControl>
                      <Input placeholder="123456789" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Speichern..." : "Einstellungen speichern"}
            </Button>
            {settings && (
              <>
                {settings.webhookRegistered ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleRemoveWebhook}
                    disabled={isRegistering}
                  >
                    {isRegistering ? "..." : "Webhook entfernen"}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleRegisterWebhook}
                    disabled={isRegistering}
                  >
                    {isRegistering ? "Registrierung..." : "Webhook registrieren"}
                  </Button>
                )}
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleRemove}
                >
                  Bot-Verbindung entfernen
                </Button>
              </>
            )}
          </div>
        </form>
      </Form>
    </section>
  );
}
