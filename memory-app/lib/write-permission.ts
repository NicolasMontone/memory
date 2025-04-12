import { Permission } from "@/app/permissions/actions";
import fs from "fs";

export default async function writePermission(permission: Permission) {
	const permissions = JSON.parse(fs.readFileSync("/Users/sebastian.papanicolau/memory/build/permissions.json", "utf8"))
	permissions.push(permission);
	fs.writeFileSync("/Users/sebastian.papanicolau/memory/build/permissions.json", JSON.stringify(permissions, null, 2));
} 