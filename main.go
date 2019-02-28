package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"strings"

	"github.com/google/go-github/github"
	"golang.org/x/oauth2"
)

func main() {
	eventName := os.Getenv("GITHUB_EVENT_NAME")
	if eventName != "pull_request" {
		fmt.Printf("Ignoring event %s (only listens for 'pull_request')\n", eventName)
		return
	}

	ctx := context.Background()
	client := newClient(ctx)

	f, err := os.Open(os.Getenv("GITHUB_EVENT_PATH"))
	if err != nil {
		log.Fatal(err)
	}

	decorder := json.NewDecoder(f)
	var triggerEvent github.PullRequestEvent
	if err := decorder.Decode(&triggerEvent); err != nil {
		log.Fatal(err)
	}

	fullRepo := os.Getenv("GITHUB_REPOSITORY")
	repo := strings.SplitN(fullRepo, "/", 2)
	if len(repo) != 2 {
		log.Fatalf("Invalid repo name: %s\n", fullRepo)
	}

	number := *triggerEvent.Number

	body := os.Getenv("COMMENT")
	if len(body) > 0 {
		issueComment := &github.IssueComment{Body: &body}
		_, _, err = client.Issues.CreateComment(ctx, repo[0], repo[1], number, issueComment)
		if err != nil {
			log.Fatal(err)
		}
	}

	state := "closed"
	pr := &github.PullRequest{State: &state}
	_, _, err = client.PullRequests.Edit(ctx, repo[0], repo[1], number, pr)
	if err != nil {
		log.Fatal(err)
	}

	log.Printf("Closed PR %d\n", number)
}

func newClient(ctx context.Context) *github.Client {
	token := os.Getenv("GITHUB_TOKEN")

	ts := oauth2.StaticTokenSource(
		&oauth2.Token{AccessToken: token},
	)
	tc := oauth2.NewClient(ctx, ts)

	return github.NewClient(tc)
}
