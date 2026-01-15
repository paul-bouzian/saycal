import { createFileRoute } from "@tanstack/react-router";

// Sample data for demo purposes - no real user data exposed
const sampleEvents = [
	{
		id: "1",
		title: "Team Standup",
		startAt: new Date("2026-01-15T09:00:00"),
		endAt: new Date("2026-01-15T09:30:00"),
		color: "#B552D9",
	},
	{
		id: "2",
		title: "Product Review",
		startAt: new Date("2026-01-15T14:00:00"),
		endAt: new Date("2026-01-15T15:00:00"),
		color: "#FA8485",
	},
	{
		id: "3",
		title: "Client Call",
		startAt: new Date("2026-01-16T10:00:00"),
		endAt: new Date("2026-01-16T11:00:00"),
		color: "#5d67e3",
	},
];

export const Route = createFileRoute("/demo/drizzle")({
	component: DemoDrizzle,
});

function DemoDrizzle() {
	return (
		<div
			className="flex items-center justify-center min-h-screen p-4 text-white"
			style={{
				background:
					"linear-gradient(135deg, #0c1a2b 0%, #1a2332 50%, #16202e 100%)",
			}}
		>
			<div
				className="w-full max-w-2xl p-8 rounded-xl shadow-2xl border border-white/10"
				style={{
					background:
						"linear-gradient(135deg, rgba(22, 32, 46, 0.95) 0%, rgba(12, 26, 43, 0.95) 100%)",
					backdropFilter: "blur(10px)",
				}}
			>
				<div
					className="flex items-center justify-center gap-4 mb-8 p-4 rounded-lg"
					style={{
						background:
							"linear-gradient(90deg, rgba(93, 103, 227, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)",
						border: "1px solid rgba(93, 103, 227, 0.2)",
					}}
				>
					<div className="relative group">
						<div className="absolute -inset-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 rounded-lg blur-lg opacity-60 group-hover:opacity-100 transition duration-500" />
						<div className="relative bg-gradient-to-br from-indigo-600 to-purple-600 p-3 rounded-lg">
							<img
								src="/drizzle.svg"
								alt="Drizzle Logo"
								className="w-8 h-8 transform group-hover:scale-110 transition-transform duration-300"
							/>
						</div>
					</div>
					<h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-300 via-purple-300 to-indigo-300 text-transparent bg-clip-text">
						Drizzle Database Demo
					</h1>
				</div>

				<h2 className="text-2xl font-bold mb-4 text-indigo-200">
					Sample Events
				</h2>

				<ul className="space-y-3 mb-6">
					{sampleEvents.map((event) => (
						<li
							key={event.id}
							className="rounded-lg p-4 shadow-md border transition-all hover:scale-[1.02] cursor-pointer group"
							style={{
								background:
									"linear-gradient(135deg, rgba(93, 103, 227, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)",
								borderColor: "rgba(93, 103, 227, 0.3)",
							}}
						>
							<div className="flex items-center justify-between">
								<span className="text-lg font-medium text-white group-hover:text-indigo-200 transition-colors">
									{event.title}
								</span>
								<span
									className="w-3 h-3 rounded-full"
									style={{ backgroundColor: event.color }}
								/>
							</div>
							<div className="text-xs text-indigo-300/70 mt-2">
								{event.startAt.toLocaleString()} -{" "}
								{event.endAt.toLocaleString()}
							</div>
						</li>
					))}
				</ul>

				<div
					className="p-6 rounded-lg border"
					style={{
						background: "rgba(93, 103, 227, 0.05)",
						borderColor: "rgba(93, 103, 227, 0.2)",
					}}
				>
					<h3 className="text-lg font-semibold mb-2 text-indigo-200">
						Powered by Drizzle ORM
					</h3>
					<p className="text-sm text-indigo-300/80 mb-4">
						Next-generation ORM for Node.js & TypeScript with PostgreSQL
					</p>
					<div className="space-y-2 text-sm">
						<p className="text-indigo-200 font-medium">Database Commands:</p>
						<ul className="list-disc list-inside space-y-2 text-indigo-300/80">
							<li>
								<code className="px-2 py-1 rounded bg-black/30 text-purple-300">
									bun run db:push
								</code>{" "}
								- Push schema to database
							</li>
							<li>
								<code className="px-2 py-1 rounded bg-black/30 text-purple-300">
									bun run db:studio
								</code>{" "}
								- Open Drizzle Studio
							</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	);
}
