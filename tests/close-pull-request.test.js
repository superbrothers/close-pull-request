jest.mock("@actions/github");

import { GitHub, context } from "@actions/github";
import * as core from "@actions/core";
import { run } from "../src/close-pull-request";
import * as errors from "../src/errors";

describe("Close Pull Request", () => {
  let update;
  let createComment;
  let inputs;

  beforeEach(() => {
    inputs = { github_token: "token" };
    ((core) => {
      core.getInput = jest.fn().mockImplementation((name) => {
        return inputs[name];
      });
    })(core);

    update = jest.fn().mockResolvedValue();
    createComment = jest.fn().mockResolvedValue();

    context.eventName = "pull_request_target";

    context.repo = {
      owner: "owner",
      repo: "repo",
    };

    context.issue = {
      ...context.repo,
      number: 1,
    };

    const github = {
      issues: {
        createComment,
      },
      pulls: {
        update,
      },
    };

    GitHub.mockImplementation(() => github);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should update a pull request", async () => {
    await run();

    expect(update).toHaveBeenCalledWith({
      ...context.repo,
      pull_number: context.issue.number,
      state: "closed",
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

  describe("when GITHUB_TOKEN env variable is set", () => {
    let warnSpy;

    beforeEach(() => {
      process.env.GITHUB_TOKEN = "token";
      warnSpy = jest.spyOn(core, "warning");
    });

    afterEach(() => {
      delete process.env.GITHUB_TOKEN;
    });

    it("should throw 'no token' error", async () => {
      await run();

      expect(warnSpy).toHaveBeenCalled();
      expect(update).toHaveBeenCalledWith({
        ...context.repo,
        pull_number: context.issue.number,
        state: "closed",
      });
    });
  });

  describe("when 'comment' input is passed", () => {
    const comment = "comment";

    beforeEach(() => {
      inputs["comment"] = comment;
    });

    it("should create a comment", async () => {
      await run();
      expect(createComment).toHaveBeenCalledWith({
        ...context.repo,
        issue_number: context.issue.number,
        body: comment,
      });
    });

    it("should update a pull request", async () => {
      await run();

      expect(update).toHaveBeenCalledWith({
        ...context.repo,
        pull_number: context.issue.number,
        state: "closed",
      });
    });
  });
});
