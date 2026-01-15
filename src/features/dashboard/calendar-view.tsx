"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Suspense, useCallback, useMemo, useRef } from "react";
import { CalendarBody } from "@/components/calendar/calendar-body";
import { CalendarProvider } from "@/components/calendar/contexts/calendar-context";
import { DndProvider } from "@/components/calendar/contexts/dnd-context";
import { CalendarHeader } from "@/components/calendar/header/calendar-header";
import type { IEvent, IUser } from "@/components/calendar/interfaces";
import { CalendarSkeleton } from "@/components/calendar/skeletons/calendar-skeleton";
import type { TEventColor } from "@/components/calendar/types";
import type { Event } from "@/db/schema";
import {
	createEvent,
	deleteEvent,
	getEvents,
	updateEvent,
} from "@/lib/actions/events";
import { authClient } from "@/lib/auth";

// Map hex colors to calendar color names
const HEX_TO_COLOR: Record<string, TEventColor> = {
	"#B552D9": "purple", // SayCal primary
	"#FA8485": "red", // SayCal secondary
	"#3B82F6": "blue",
	"#22C55E": "green",
	"#EF4444": "red",
	"#F59E0B": "yellow",
	"#F97316": "orange",
	"#6366F1": "purple",
};

// Map calendar color names back to hex
const COLOR_TO_HEX: Record<TEventColor, string> = {
	purple: "#B552D9",
	red: "#FA8485",
	blue: "#3B82F6",
	green: "#22C55E",
	yellow: "#F59E0B",
	orange: "#F97316",
};

function createDefaultUser(
	userId: string,
	email: string,
	name?: string | null,
): IUser {
	return {
		id: userId,
		name: name ?? email.split("@")[0],
		picturePath: null,
	};
}

function toCalendarEvent(
	event: Event,
	user: IUser,
	idMap: Map<string, number>,
): IEvent {
	let numericId = idMap.get(event.id);
	if (!numericId) {
		numericId = idMap.size + 1;
		idMap.set(event.id, numericId);
	}

	const color: TEventColor = HEX_TO_COLOR[event.color ?? ""] ?? "purple";

	return {
		id: numericId,
		title: event.title,
		startDate: event.startAt.toISOString(),
		endDate: event.endAt.toISOString(),
		color,
		description: event.description ?? "",
		user,
	};
}

function getUuidFromNumericId(
	numericId: number,
	idMap: Map<string, number>,
): string | undefined {
	for (const [uuid, id] of idMap.entries()) {
		if (id === numericId) {
			return uuid;
		}
	}
	return undefined;
}

function CalendarContent() {
	const { data: session } = authClient.useSession();
	const queryClient = useQueryClient();

	// Store mapping between UUIDs and numeric IDs
	const idMapRef = useRef<Map<string, number>>(new Map());

	const userId = session?.user?.id;
	const userEmail = session?.user?.email || "";
	const userName = session?.user?.name;

	// Calculate date range for query (3 months window)
	const dateRange = useMemo(() => {
		const now = new Date();
		const startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
		const endDate = new Date(now.getFullYear(), now.getMonth() + 2, 0);
		return { startDate, endDate };
	}, []);

	// Fetch events (userId is now extracted from session server-side)
	const { data: dbEvents = [], isLoading } = useQuery({
		queryKey: ["events", userId, dateRange.startDate, dateRange.endDate],
		queryFn: async () => {
			if (!userId) return [];
			const result = await getEvents({
				startDate: dateRange.startDate,
				endDate: dateRange.endDate,
			});
			return result;
		},
		enabled: !!userId,
	});

	// Create mutation
	const createMutation = useMutation({
		mutationFn: createEvent,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["events"] });
		},
	});

	// Update mutation
	const updateMutation = useMutation({
		mutationFn: updateEvent,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["events"] });
		},
	});

	// Delete mutation
	const deleteMutation = useMutation({
		mutationFn: deleteEvent,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["events"] });
		},
	});

	// Create default user
	const defaultUser = useMemo(() => {
		if (!userId) return { id: "0", name: "User", picturePath: null };
		return createDefaultUser(userId, userEmail, userName);
	}, [userId, userEmail, userName]);

	// Convert events for calendar
	const calendarEvents = useMemo(() => {
		idMapRef.current.clear();
		return dbEvents.map((event) =>
			toCalendarEvent(event, defaultUser, idMapRef.current),
		);
	}, [dbEvents, defaultUser]);

	// Users list (just current user for now)
	const users = useMemo(() => [defaultUser], [defaultUser]);

	// Create a custom CalendarProvider that intercepts mutations
	// We wrap the CalendarProvider and override the callbacks
	const handleAddEvent = useCallback(
		async (event: IEvent) => {
			if (!userId) return;

			const hexColor = COLOR_TO_HEX[event.color] || "#B552D9";

			await createMutation.mutateAsync({
				title: event.title,
				description: event.description || undefined,
				startAt: new Date(event.startDate),
				endAt: new Date(event.endDate),
				color: hexColor,
				createdVia: "manual",
			});
		},
		[userId, createMutation],
	);

	const handleUpdateEvent = useCallback(
		async (event: IEvent) => {
			if (!userId) return;

			const uuid = getUuidFromNumericId(event.id, idMapRef.current);
			if (!uuid) {
				console.error("Could not find UUID for event", event.id);
				return;
			}

			const hexColor = COLOR_TO_HEX[event.color] || "#B552D9";

			await updateMutation.mutateAsync({
				id: uuid,
				title: event.title,
				description: event.description || undefined,
				startAt: new Date(event.startDate),
				endAt: new Date(event.endDate),
				color: hexColor,
			});
		},
		[userId, updateMutation],
	);

	const handleRemoveEvent = useCallback(
		async (eventId: number) => {
			if (!userId) return;

			const uuid = getUuidFromNumericId(eventId, idMapRef.current);
			if (!uuid) {
				console.error("Could not find UUID for event", eventId);
				return;
			}

			await deleteMutation.mutateAsync({ id: uuid });
		},
		[userId, deleteMutation],
	);

	if (isLoading) {
		return <CalendarSkeleton />;
	}

	return (
		<CalendarProvider
			events={calendarEvents}
			users={users}
			view="month"
			onEventCreate={handleAddEvent}
			onEventUpdate={handleUpdateEvent}
			onEventDelete={handleRemoveEvent}
		>
			<DndProvider showConfirmation={false}>
				<div className="h-full w-full rounded-xl border">
					<CalendarHeader />
					<CalendarBody />
				</div>
			</DndProvider>
		</CalendarProvider>
	);
}

export function CalendarView() {
	return (
		<Suspense fallback={<CalendarSkeleton />}>
			<CalendarContent />
		</Suspense>
	);
}
