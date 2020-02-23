export const ignoreEvent = new Error(
  "Ignoring this event (only listens for 'pull_request')"
);
export const noToken = new Error(
  "You have to provide the GITHUB_TOKEN inside your secrets configuration and provide it as an env variable"
);
