import fs from "fs";

export default async function getMemory() {
	const memory = JSON.parse(fs.readFileSync("/Users/sebastian.papanicolau/memory/build/memory.json", "utf8"))
	return memory;
} 