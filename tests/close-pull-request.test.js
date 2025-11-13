let mockContext;
let mockOctokit;

jest.mock("@actions/github", () => ({
  get context() {
    return mockContext;
  },
  getOctokit: () => mockOctokit
}));

import { context } from "@actions/github";
import * as core from "@actions/core";
import { run } from "../src/close-pull-request";
import * as errors from "../src/errors";


jest.mock("fs", () => ({
  ...jest.requireActual("fs"),
  readFileSync: jest.fn(),
  existsSync: jest.fn()
}));
const fs = require("fs");

describe("Close Pull Request", () => {
  let update;
  let createComment;
  let inputs;

  beforeEach(() => {
    fs.readFileSync.mockImplementation((path, encoding) => {
      return "alice\nbob\ncharlie";
    });
    fs.existsSync.mockImplementation((path) => {
      return true;
    });

    inputs = { github_token: "token", "allowlist": "" };
    ((core) => {
      core.getInput = jest.fn().mockImplementation((name) => {
        return inputs[name];
      });
    })(core);


    mockContext = {
      eventName: "pull_request_target",
      repo: { owner: "owner", repo: "repo" },
      issue: { owner: "owner", repo: "repo", number: 1 },
      payload: {
        pull_request: {
          user: { login: "fred" }
        }
      }
    };

    update = jest.fn().mockResolvedValue();
    createComment = jest.fn().mockResolvedValue();

    mockOctokit = {
      rest: {
        issues: { createComment: createComment },
        pulls: { update: update }
      }
    };
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

  describe("when 'allowlist' input is passed and unauthorized user opens PR", () => {
    beforeEach(() => {
      inputs["allowlist"] = "ALLOW";
    });

    it("should close PR from unauthorized user", async () => {
      await run();

      expect(update).toHaveBeenCalledWith({
        ...context.repo,
        pull_number: context.issue.number,
        state: "closed",
      });
    })
  });

  describe("when 'allowlist' input is passed and authorized user opens PR", () => {
    beforeEach(() => {
      inputs["allowlist"] = "ALLOW";
      mockContext["payload"]["pull_request"]["user"]["login"] = "alice";
    });

    it("should allow PR from authorized user", async () => {
      await run();

      expect(update).not.toHaveBeenCalledWith({
        ...context.repo,
        pull_number: context.issue.number,
        state: "closed",
      });
    })
  });

});
