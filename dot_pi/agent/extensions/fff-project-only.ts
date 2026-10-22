import { realpathSync } from "node:fs";
import { homedir } from "node:os";
import { parse } from "node:path";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import registerFff from "../npm/node_modules/pi-fff/index.ts";

// FFF refuses to index home directories and filesystem roots. Keep the npm
// package installed for updates, but only register it in supported directories.
export default function (pi: ExtensionAPI) {
	const cwd = realpathSync(process.cwd());
	if (cwd === realpathSync(homedir()) || cwd === parse(cwd).root) return;
	registerFff(pi);
}
