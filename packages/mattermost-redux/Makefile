.PHONY: check-style clean pre-run test install update-dependencies

node_modules: package.json
	@if ! [ $(shell which npm) ]; then \
		echo "npm is not installed"; \
		exit 1; \
	fi

	@echo Getting dependencies using npm

	npm install --ignore-scripts

check-style: | pre-run node_modules
	@echo Checking for style guide compliance

	npm run check

clean: pre-run
	@echo Cleaning app

	rm -rf node_modules 

pre-run:
	@echo Make sure no previous build are in the folder

	@rm -rf build/* action_types actions client constants reducers selectors store utils types mattermost.client4* index.* mattermost.websocket_client*

test: check-style
	npm test

check-types: | pre-run node_modules
	npm run tsc

install: node_modules

bundle: | pre-run node_modules
	npm run build

update-dependencies: # Updates the dependencies
	npm update --depth 9999
	npm audit fix
	@echo Automatic dependency update complete.
	@echo You should manually inspect changes to package.json and pin exact versions of packages where appropriate.
