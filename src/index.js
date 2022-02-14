import * as core from "@actions/core";
import { run } from "./close-pull-request";

run().catch((err) => {
  core.setFailed(err.message);
});
