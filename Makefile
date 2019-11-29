include Makefile.mk

REGISTRY_HOST=280925583500.dkr.ecr.eu-central-1.amazonaws.com
USERNAME=
NAME=gitlab-build-monitor
IMAGE=$(REGISTRY_HOST)/$(NAME)

ifndef CI_JOB_ID
	NPM_INSTALL_COMMAND=install
else
	NPM_INSTALL_COMMAND=ci
endif

npm-install:
	npm $(NPM_INSTALL_COMMAND)

test: npm-install
	npm run lint
	echo skip npm run test

pre-build: test
	npm run build:prod

npm-check: npm-install
	npm-check --no-emoji --no-spinner --skip-unused

pre-push:
	@if [[ "$(VERSION)" =~ .*-dirty ]] ; then echo "refusing to push a dirty image." && git status -s . && exit 1 ; else exit 0; fi

update-platform:
	rm -rf target/platform
	git clone --depth 2 git@gitlab.com:verenigingcoin/platform.git target/platform
	cd target/platform &&  \
		bin/cfn-ecs-task-update-docker-image --image $(IMAGE):$(VERSION) . && \
		if [[ -n $$(git status -s --porcelain) ]] ; then \
			git commit -m 'new release $(VERSION) of $(NAME).' -a && git push ; \
		else \
			echo "INFO: image already using $(VERSION)" ; \
		fi
