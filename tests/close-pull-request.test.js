jest.mock("@actions/github");

import { GitHub, context } from "@actions/github";
import * as core from "@actions/core";
import { run } from "../src/close-pull-request";
import * as errors from "../src/errors";

describe("Close Pull Request", () => {
  let update;
  let createComment;

  beforeEach(() => {
    process.env.GITHUB_TOKEN = "token";

    update = jest.fn().mockResolvedValue();
    createComment = jest.fn().mockResolvedValue();

    context.eventName = "pull_request_target";

    context.repo = {
      owner: "owner",
      repo: "repo"
    };

    context.issue = {
      ...context.repo,
      number: 1
    };

    const github = {
      issues: {
        createComment
      },
      pulls: {
        update
      }
    };

    GitHub.mockImplementation(() => github);
  });

  it("should update a pull request", async () => {
    await run();

    expect(update).toHaveBeenCalledWith({
      ...context.repo,
      pull_number: context.issue.number,
      state: "closed"
    });
  });

  describe("when event type is not pull_request_target", () => {
    beforeEach(() => {
      context.eventName = "push";
    });

    it("should throw 'ignore event' error", async () => {
      await expect(run()).rejects.toEqual(errors.ignoreEvent);
    });
  });

  describe("when GITHUB_TOKEN env variable is not set", () => {
    beforeEach(() => {
      delete process.env.GITHUB_TOKEN;
    });

    it("should throw 'no token' error", async () => {
      await expect(run()).rejects.toEqual(errors.noToken);
    });
  });

  describe("when 'comment' input is passed", () => {
    let comment = "comment";

    beforeEach(() => {
      core.getInput = jest.fn().mockImplementation(name => {
        if (name === "comment") {
          return comment;
        }
        return "";
      });
    });

    it("should create a comment", async () => {
      await run();
      expect(createComment).toHaveBeenCalledWith({
        ...context.repo,
        issue_number: context.issue.number,
        body: comment
      });
    });

    it("should update a pull request", async () => {
      await run();

      expect(update).toHaveBeenCalledWith({
        ...context.repo,
        pull_number: context.issue.number,
        state: "closed"
      });
    });
  });
});
