import { Permission } from "@/app/permissions/actions";
import getMemory from "@/lib/get-memory";
import getPermissions from "@/lib/get-permissions";
import { openai } from "@ai-sdk/openai";
import { generateObject, generateText } from "ai";
import { z } from "zod";

export async function promptMemory({ question, permission }: { question: string, permission: Permission['prompt'] }) {
	const memory = await getMemory();

	const permissions = await getPermissions();


	const { object: { allowed } } = await generateObject({
		model: openai("gpt-4o-mini"),
		schema: z.object({
			allowed: z.boolean()
		}),
		prompt: `
		based on this permissions: ${JSON.stringify(permissions)}
		determine if the user is allowed to ${permission}	`
	})

	if (!allowed) {
		return { data: null, status: 403, message: "You are not allowed to access this resource" }
	}

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

	console.log({ answer });

	return { data: answer.text, status: 200 };
}