.PHONY: build test run clean stop check-style fix-style run-unit emojis help package-ci storybook build-storybook update-dependencies

BUILD_SERVER_DIR = ../mattermost-server
BUILD_WEBAPP_DIR = ../mattermost-webapp
MM_UTILITIES_DIR = ../mattermost-utilities
EMOJI_TOOLS_DIR = ./build/emoji
export NODE_OPTIONS=--max-old-space-size=4096

build-storybook: node_modules ## Build the storybook
	@echo Building storybook

	npm run build-storybook

storybook: node_modules ## Run the storybook development environment
	npm run storybook

check-style: node_modules ## Checks JS file for ESLint confirmity
	@echo Checking for style guide compliance

	npm run check

fix-style: node_modules ## Fix JS file ESLint issues
	@echo Fixing lint issues to follow style guide

	npm run fix

check-types: node_modules ## Checks TS file for TypeScript confirmity
	@echo Checking for TypeScript compliance

	npm run check-types

test: node_modules ## Runs tests
	@echo Running jest unit/component testing

	npm run test

i18n-extract: ## Extract strings for translation from the source code
	npm run mmjstool -- i18n extract-webapp

node_modules: package.json package-lock.json
	@echo Getting dependencies using npm

	npm install
	touch $@

package: build ## Packages app
	@echo Packaging webapp

	mkdir tmp
	mv dist tmp/client
	tar -C tmp -czf mattermost-webapp.tar.gz client
	mv tmp/client dist
	rmdir tmp

package-ci: ## used in the CI to build the package and bypass the npm install
	@echo Building mattermost Webapp

	rm -rf dist
	npm run build

	@echo Packaging webapp

	mkdir tmp
	mv dist tmp/client
	tar -C tmp -czf mattermost-webapp.tar.gz client
	mv tmp/client dist
	rmdir tmp

build: node_modules ## Builds the app
	@echo Building mattermost Webapp

	rm -rf dist

	npm run build

run: node_modules ## Runs app
	@echo Running mattermost Webapp for development

	npm run run &

dev: node_modules ## Runs webpack-dev-server
	npm run dev-server

run-fullmap: node_modules ## Legacy alias to run
	@echo Running mattermost Webapp for development

	npm run run &

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

e2e-test: node_modules
	@echo E2E: Running mattermost-mysql-e2e
	@if [ $(shell docker ps -a | grep -ci mattermost-mysql-e2e) -eq 0 ]; then \
		echo starting mattermost-mysql-e2e; \
		docker run --name mattermost-mysql-e2e -p 35476:3306 -e MYSQL_ROOT_PASSWORD=mostest \
		-e MYSQL_USER=mmuser -e MYSQL_PASSWORD=mostest -e MYSQL_DATABASE=mattermost_test -d mysql:5.7 > /dev/null; \
	elif [ $(shell docker ps | grep -ci mattermost-mysql-e2e) -eq 0 ]; then \
		echo restarting mattermost-mysql-e2e; \
		docker start mattermost-mysql-e2e > /dev/null; \
	fi

	cd $(BUILD_SERVER_DIR) && [[ -f config/config.json ]] && \
		cp config/config.json config/config-backup.json && make config-reset || \
		echo "config.json not found" && make config-reset

	@echo E2E: Starting the server
	cd $(BUILD_SERVER_DIR) && $(MAKE) run

	@echo E2E: Generating test data
	cd $(BUILD_SERVER_DIR) && $(MAKE) test-data

	@echo E2E: Running end-to-end testing
	cd e2e && npm install && npm run cypress:run

	@echo E2E: Stoppping the server
	cd $(BUILD_SERVER_DIR) && $(MAKE) stop

	@echo E2E: stopping mattermost-mysql-e2e
	docker stop mattermost-mysql-e2e > /dev/null

	cd $(BUILD_SERVER_DIR) && [[ -f config/config-backup.json ]] && \
		cp config/config-backup.json config/config.json && echo "revert local config.json" || \
		echo "config-backup.json not found" && sed -i'' -e 's|"DataSource": ".*"|"DataSource": "mmuser:mostest@tcp(dockerhost:3306)/mattermost_test?charset=utf8mb4,utf8\u0026readTimeout=30s\u0026writeTimeout=30s"|g' config/config.json

	@echo E2E: Tests completed

clean-e2e:
	@if [ $(shell docker ps -a | grep -ci mattermost-mysql-e2e) -eq 1 ]; then \
		echo stopping mattermost-mysql-e2e; \
		docker stop mattermost-mysql-e2e > /dev/null; \
	fi

	cd $(BUILD_SERVER_DIR) && [[ -f config/config-backup.json ]] && \
		cp config/config-backup.json config/config.json && echo "revert local config.json" || \
		echo "config-backup.json not found" && sed -i'' -e 's|"DataSource": ".*"|"DataSource": "mmuser:mostest@tcp(dockerhost:3306)/mattermost_test?charset=utf8mb4,utf8\u0026readTimeout=30s\u0026writeTimeout=30s"|g' config/config.json

emojis: ## Creates emoji JSON, JSX and Go files and extracts emoji images from the system font
	gem install bundler
	bundle install --gemfile=$(EMOJI_TOOLS_DIR)/Gemfile
	BUNDLE_GEMFILE=$(EMOJI_TOOLS_DIR)/Gemfile SERVER_DIR=$(BUILD_SERVER_DIR) bundle exec $(EMOJI_TOOLS_DIR)/make-emojis

## Help documentatin à la https://marmelab.com/blog/2016/02/29/auto-documented-makefile.html
help:
	@grep -E '^[0-9a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

update-dependencies: # Updates the dependencies
	npm update --depth 9999
	npm audit fix
	@echo Automatic dependency update complete.
	@echo You should manually inspect changes to package.json and pin exact versions of packages where appropriate.
