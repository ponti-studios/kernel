import { beforeEach } from "bun:test";
import { _resetForTesting } from "./src/execution/session-state/state";

beforeEach(() => {
  _resetForTesting();
});
