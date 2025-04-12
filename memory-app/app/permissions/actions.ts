"use server";

import { v4 as uuidv4 } from "uuid";
import writePermission from "@/lib/write-permission";


export type Permission = {
	token: string;
	prompt: string;
}

export async function createPermission(prompt: string): Promise<Permission> {
	const token = uuidv4();
	const newPermission: Permission = { token, prompt };

	await writePermission(newPermission);

	return newPermission;
} 