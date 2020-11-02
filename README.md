# :no_entry_sign: Close Pull Request

A GitHub action to automatically close a pull request.

## Usage

This Action subscribes to `pull_request_target` events. When receiving a `pull_request_target` event, this action closes the pull request triggered by the event immediately.

See [Events that trigger workflows](https://docs.github.com/en/free-pro-team@latest/actions/reference/events-that-trigger-workflows#pull_request_target) for more details about the `pull_request_target` event.

```yaml
name: Close Pull Request

on:
  pull_request_target:
    types: [opened]

jobs:
  run:
    runs-on: ubuntu-latest
    steps:
    - uses: superbrothers/close-pull-request@v3
      with:
        # Optional. Post a issue comment just before closing a pull request.
        comment: "We do not accept PRs. If you have any questions, please feel free to contact us."
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## Inputs

- `comment` - *Optional*. Post an issue comment just before closing a pull request.

## LICENSE

This software is released under the MIT License.
