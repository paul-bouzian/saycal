"use client";

import { Monitor, Moon, Sun } from "lucide-react";
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

	return (
		<div className="max-w-2xl space-y-6 p-6">
			<div>
				<h1 className="text-2xl font-bold">Settings</h1>
				<p className="text-muted-foreground">Manage your preferences</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Appearance</CardTitle>
					<CardDescription>Customize the app appearance</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-center justify-between">
						<div className="space-y-0.5">
							<Label>Theme</Label>
							<p className="text-sm text-muted-foreground">
								Select your preferred theme
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
										<span>Light</span>
									</div>
								</SelectItem>
								<SelectItem value="dark">
									<div className="flex items-center gap-2">
										<Moon className="h-4 w-4" />
										<span>Dark</span>
									</div>
								</SelectItem>
								<SelectItem value="system">
									<div className="flex items-center gap-2">
										<Monitor className="h-4 w-4" />
										<span>System</span>
									</div>
								</SelectItem>
							</SelectContent>
						</Select>
					</div>
					<div className="flex items-center justify-between">
						<Label htmlFor={timeFormatId}>24-hour time format</Label>
						<Switch id={timeFormatId} defaultChecked />
					</div>
					<div className="flex items-center justify-between">
						<Label htmlFor={weekStartId}>Week starts on Monday</Label>
						<Switch id={weekStartId} />
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Notifications</CardTitle>
					<CardDescription>Configure notification preferences</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-center justify-between">
						<Label htmlFor={remindersId}>Event reminders</Label>
						<Switch id={remindersId} defaultChecked />
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
