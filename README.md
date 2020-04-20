# :no_entry_sign: Close Pull Request

A GitHub action to automatically close a pull request.

Note that only pull requests being opened from the same repository can be closed. This action will not currently work for pull requests from forks -- like is common in open source projects -- because the token for forked pull request workflows does not have write permissions.

## Usage

This Action subscribes to `pull_request` events. When receiving a `pull_request` event, this action closes the pull request triggered by the event immediately.

```yaml
name: Close Pull Request

on:
  pull_request:
    types: [opened]

jobs:
  run:
    runs-on: ubuntu-latest
    steps:
    - uses: superbrothers/close-pull-request@v2
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
