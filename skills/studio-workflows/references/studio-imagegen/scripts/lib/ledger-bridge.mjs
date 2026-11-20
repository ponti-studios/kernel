// studio-imagegen's ledger entry point. The bridge itself lives in studio-core.
import { recordRender as record } from "../../../studio-core/scripts/lib/ledger-bridge.mjs";

export const recordRender = (args) => record({ tool: "studio-imagegen", ...args });
