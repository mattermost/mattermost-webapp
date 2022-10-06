## Local development

#### 1. Start local server in a separate terminal.

#### 2. Install dependencies and run the test.

```
# Install npm packages
npm i

# Install browser binaries as prompted if Playwright is just installed or updated
# See https://playwright.dev/docs/browsers
npx playwright install

# Run specific test of all projects -- chrome, firefox, iphone and ipad.
# See https://playwright.dev/docs/test-cli.
npm run test -- login

# Run specific test of a project
npm run test -- login --project=chrome

# Or run all tests
npm run test
```

#### 3. Inspect test results at `/test-results` folder when something failed unexpectedly.

## Updating screenshots is strictly via Playwright's docker container for consistency

#### 1. Run docker container using latest focal version

In this directory at `mattermost-webapp/e2e/playwright`, run docker container

```
docker run -it --rm -v "$(pwd):/e2e-playwright/" --ipc=host mcr.microsoft.com/playwright:v1.25.0-focal /bin/bash
```

#### 2. Inside the docker container

```
export PW_BASE_URL=http://host.docker.internal:8065
cd e2e-playwright

# Install npm packages
npm i

# Run specific test. See https://playwright.dev/docs/test-cli.
npm run test -- login --project=chrome

# Or run all tests
npm run test
```

## Page/Component Object Model

See https://playwright.dev/docs/test-pom.

Page and component abstractions are located at `./support/ui`. It should be first class before writing a spec file so that any future change in DOM structure will be done in one place only. No static UI text and fixed locator should be written in the spec file.
