REPO := superbrothers/auto-close-action

.PHONY: image
image:
		docker build -t $(REPO) .
