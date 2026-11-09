import { mkdir, writeFile } from "node:fs/promises";
import { initialConfig } from "../src/lib/cms";
await mkdir("database", { recursive: true });
await writeFile("database/default-site-content.json", JSON.stringify({ config: initialConfig }, null, 2) + "\n");
console.log("Exported database/default-site-content.json");
