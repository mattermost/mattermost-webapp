.PHONY: build test run clean stop check-style run-unit emojis help

BUILD_SERVER_DIR = ../mattermost-server
EMOJI_TOOLS_DIR = ./build/emoji

check-style: .npminstall ## Checks JS file for ESLint confirmity
	@echo Checking for style guide compliance

	npm run check

test: .npminstall ## Runs tests
	@echo Running jest unit/component testing

	npm run test

.npminstall: package.json package-lock.json
	@echo Getting dependencies using npm

	npm install
	cd node_modules/mattermost-redux; npm run build

	touch $@

package: build ## Packages app
	@echo Packaging webapp

	mkdir tmp
	mv dist tmp/client
	tar -C tmp -czf mattermost-webapp.tar.gz client
	mv tmp/client dist
	rmdir tmp

build: .npminstall ## Builds the app
	@echo Building mattermost Webapp

	rm -rf dist

	npm run build

run: .npminstall ## Runs app
	@echo Running mattermost Webapp for development

	npm run run &

run-fullmap: .npminstall ## Runs the app with the JS mapped to source (good for debugger)
	@echo FULL SOURCE MAP Running mattermost Webapp for development FULL SOURCE MAP

	npm run run-fullmap &

stop: ## Stops webpack
	@echo Stopping changes watching

ifeq ($(OS),Windows_NT)
	wmic process where "Caption='node.exe' and CommandLine like '%webpack%'" call terminate
else
	@for PROCID in $$(ps -ef | grep "[n]ode.*[w]ebpack" | awk '{ print $$2 }'); do \
		echo stopping webpack watch $$PROCID; \
		kill $$PROCID; \
	done
endif

restart: | stop run ## Restarts the app

clean: ## Clears cached; deletes node_modules and dist directories
	@echo Cleaning Webapp

	rm -rf dist
	rm -rf node_modules
	rm -f .npminstall

emojis: ## Creates emoji JSX file and extracts emoji images from the system font
	gem install bundler
	bundle install --gemfile=$(EMOJI_TOOLS_DIR)/Gemfile
	BUNDLE_GEMFILE=$(EMOJI_TOOLS_DIR)/Gemfile bundle exec $(EMOJI_TOOLS_DIR)/make-emojis

## Help documentatin à la https://marmelab.com/blog/2016/02/29/auto-documented-makefile.html
help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'
