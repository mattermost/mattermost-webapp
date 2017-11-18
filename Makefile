.PHONY: build test run clean stop check-style run-unit emojis

BUILD_SERVER_DIR = ../mattermost-server
EMOJI_TOOLS_DIR = ./build/emoji

check-style: .yarninstall
	@echo Checking for style guide compliance

	yarn run check

test: .yarninstall
	@echo Running jest unit/component testing

	yarn run test

.yarninstall: package.json
	@echo Getting dependencies using yarn

	yarn install
	cd node_modules/mattermost-redux; npm run build

	touch $@

package: build
	@echo Packaging webapp

	mkdir tmp
	mv dist tmp/client
	tar -C tmp -czf mattermost-webapp.tar.gz client
	mv tmp/client dist
	rmdir tmp


build: .yarninstall
	@echo Building mattermost Webapp

	rm -rf dist

	yarn run build

run: .yarninstall
	@echo Running mattermost Webapp for development

	yarn run run &

run-fullmap: .yarninstall
	@echo FULL SOURCE MAP Running mattermost Webapp for development FULL SOURCE MAP

	yarn run run-fullmap &

stop:
	@echo Stopping changes watching

ifeq ($(OS),Windows_NT)
	wmic process where "Caption='node.exe' and CommandLine like '%webpack%'" call terminate
else
	@for PROCID in $$(ps -ef | grep "[n]ode.*[w]ebpack" | awk '{ print $$2 }'); do \
		echo stopping webpack watch $$PROCID; \
		kill $$PROCID; \
	done
endif

clean:
	@echo Cleaning Webapp

	yarn cache clean

	rm -rf dist
	rm -rf node_modules
	rm -f .yarninstall

emojis:
	gem install bundler
	bundle install --gemfile=$(EMOJI_TOOLS_DIR)/Gemfile
	BUNDLE_GEMFILE=$(EMOJI_TOOLS_DIR)/Gemfile bundle exec $(EMOJI_TOOLS_DIR)/make-emojis
