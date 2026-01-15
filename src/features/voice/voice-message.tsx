"use client";

import { Calendar, Check, Edit, List, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface VoiceResponse {
	type: "success" | "info" | "error";
	text: string;
	action?: "created" | "updated" | "deleted" | "listed";
	events?: Array<{ title: string; date: string; time: string }>;
}

const actionIcons = {
	created: Calendar,
	updated: Edit,
	deleted: Trash2,
	listed: List,
};

interface VoiceMessageProps {
	response: VoiceResponse;
}

export function VoiceMessage({ response }: VoiceMessageProps) {
	const Icon = response.action ? actionIcons[response.action] : Check;

	return (
		<div className="flex gap-3">
			<div
				className={cn(
					"flex size-8 shrink-0 items-center justify-center rounded-full",
					response.type === "success" && "bg-green-100",
					response.type === "info" && "bg-blue-100",
					response.type === "error" && "bg-red-100",
				)}
			>
				<Icon
					className={cn(
						"size-4",
						response.type === "success" && "text-green-600",
						response.type === "info" && "text-blue-600",
						response.type === "error" && "text-red-600",
					)}
				/>
			</div>

			<div className="flex-1">
				<p className="text-sm">{response.text}</p>

				{response.events && response.events.length > 0 && (
					<div className="mt-2 space-y-1">
						{response.events.map((event, i) => (
							<div
								key={`${event.title}-${i}`}
								className="flex justify-between rounded bg-muted px-2 py-1 text-xs"
							>
								<span className="font-medium">{event.title}</span>
								<span className="text-muted-foreground">
									{event.date} {event.time}
								</span>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
