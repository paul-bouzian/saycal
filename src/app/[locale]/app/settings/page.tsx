"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { useId } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

export default function SettingsPage() {
	const timeFormatId = useId();
	const weekStartId = useId();
	const remindersId = useId();
	const { theme, setTheme } = useTheme();
	const t = useTranslations();

	return (
		<div className="max-w-2xl space-y-6 p-6">
			<div>
				<h1 className="text-2xl font-bold">{t("settings_title")}</h1>
				<p className="text-muted-foreground">{t("settings_subtitle")}</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>{t("settings_appearance_title")}</CardTitle>
					<CardDescription>{t("settings_appearance_desc")}</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-center justify-between">
						<div className="space-y-0.5">
							<Label>{t("settings_theme_label")}</Label>
							<p className="text-sm text-muted-foreground">
								{t("settings_theme_desc")}
							</p>
						</div>
						<Select value={theme} onValueChange={setTheme}>
							<SelectTrigger className="w-36">
								<SelectValue placeholder="Select theme" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="light">
									<div className="flex items-center gap-2">
										<Sun className="h-4 w-4" />
										<span>{t("settings_theme_light")}</span>
									</div>
								</SelectItem>
								<SelectItem value="dark">
									<div className="flex items-center gap-2">
										<Moon className="h-4 w-4" />
										<span>{t("settings_theme_dark")}</span>
									</div>
								</SelectItem>
								<SelectItem value="system">
									<div className="flex items-center gap-2">
										<Monitor className="h-4 w-4" />
										<span>{t("settings_theme_system")}</span>
									</div>
								</SelectItem>
							</SelectContent>
						</Select>
					</div>
					<div className="flex items-center justify-between">
						<Label htmlFor={timeFormatId}>{t("settings_time_format_24h")}</Label>
						<Switch id={timeFormatId} defaultChecked />
					</div>
					<div className="flex items-center justify-between">
						<Label htmlFor={weekStartId}>{t("settings_week_starts_monday")}</Label>
						<Switch id={weekStartId} />
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>{t("settings_notifications_title")}</CardTitle>
					<CardDescription>{t("settings_notifications_desc")}</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-center justify-between">
						<Label htmlFor={remindersId}>{t("settings_event_reminders")}</Label>
						<Switch id={remindersId} defaultChecked />
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
