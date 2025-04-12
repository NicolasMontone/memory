import { Permission } from "@/app/permissions/actions";
import fs from "fs";

export default async function getPermissions() {
	const permissions = JSON.parse(fs.readFileSync("/Users/sebastian.papanicolau/memory/build/permissions.json", "utf8"))
	return permissions as Permission[]
} 