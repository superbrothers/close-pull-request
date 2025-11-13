import * as core from "@actions/core";
import * as github from "@actions/github";
import * as errors from "./errors";
import * as fs from "fs";

export const run = async () => {
  const context = github.context;
  if (context.eventName !== "pull_request_target") {
    throw errors.ignoreEvent;
  }

  let token = process.env["GITHUB_TOKEN"] || "";
  if (token === "") {
    token = core.getInput("github_token");
  } else {
    core.warning("GITHUB_TOKEN environment variable is deprecated.");
    core.warning(
      "GitHub Token is passed automatically, so no longer needs to be set."
    );
  }

  const client = github.getOctokit(token);

  const author = context.payload.pull_request.user.login;
  core.info(`Pull request opened by: ${author}`);

  // Read allowed users file.
  const path = core.getInput("allowlist");

  if (path.length > 0) {
    if (!fs.existsSync(path)) {
      core.setFailed(`Allow list not found: ${path}`);
      return;
    }

    const allowed = fs
      .readFileSync(path, "utf8")
      .split("\n")
      .map(u => u.trim())
      .filter(Boolean);

    if (allowed.includes(author)) {
      core.info(`'@${author}' is authorized to open PRs.`);
      return;
    }
  }

  core.setFailed(`'@${author}' is not on the collaborator allow list (${path}).`);

  // *Optional*. Post an issue comment just before closing a pull request.
  const body = core.getInput("comment") || "";
  if (body.length > 0) {
    core.info("Creating a comment");
    await client.rest.issues.createComment({
      ...context.repo,
      issue_number: context.issue.number,
      body,
    });
  }

  core.info("Updating the state of a pull request to closed");
  await client.rest.pulls.update({
    ...context.repo,
    pull_number: context.issue.number,
    state: "closed",
  });

  core.info(`Closed pull request ${context.issue.number}`);
};
