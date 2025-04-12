import getMemory from "@/lib/get-memory";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const question = searchParams.get("question");

	if (!question) {
		return new Response("Question is required", { status: 400 });
	}

	const memory = await getMemory();

	const answer = await generateText({
		model: openai("gpt-4o-mini"),
		prompt: `
		You are a helpful assistant that can answer questions about the user's memory.
		If there no relevant information in the memory, just say "I don't know".
		Here is the user's memory:
		${JSON.stringify(memory)}
		Here is the question:
		${question}
		`
	})

	return new Response(answer.text);



}