FROM golang:1.11-alpine

LABEL "com.github.actions.name"="Auto Close"
LABEL "com.github.actions.description"="Auto close pull requests"
LABEL "com.github.actions.icon"="slash"
LABEL "com.github.actions.color"="red"

WORKDIR $GOPATH/src/github.com/superbrothers/auto-close-action
COPY . .
RUN set -x && go build -o /action

ENTRYPOINT ["/action"]
