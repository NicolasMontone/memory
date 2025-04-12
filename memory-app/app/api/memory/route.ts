import getMemory from "@/lib/get-memory";

export function GET() {
	const memory = getMemory();
	return new Response(JSON.stringify(memory));
}
