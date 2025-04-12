import { promptMemory } from "@/actions/promptMemory";
import getPermissions from "@/lib/get-permissions";

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const question = searchParams.get("question");

	const token = request.headers.get("Authorization")?.split(" ")[1];

	const permissions = await getPermissions();

	const permission = permissions.find((permission) => permission.token === token);

	if (!permission) {
		return new Response("Unauthorized", { status: 401 });
	}

	if (!question) {
		return new Response("Question is required", { status: 400 });
	}

	const response = await promptMemory({ question, permission: "get recommendations" });

	if (response.status === 403) {
		return new Response(response.message, { status: response.status });
	}

	return new Response(response.data, { status: response.status });



}