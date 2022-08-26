# Compass UI

This package contains `CompassUI`, the UI library used by [the Mattermost web app](https://github.com/mattermost/mattermost-webapp) and related projects.

## Compilation and Packaging

As a member of Mattermost with write access to our NPM organization, you can build and publish this package by running the following commands:

```bash
npm run build --workspace=packages/compass-ui
npm publish --workspace=packages/compass-ui
```

Make sure to increment the version number in `package.json` first! You can add `-0`, `-1`, etc for pre-release versions or use `npm version` with options `major`, `minor`, `patch` or a manual version number.

To increase the patch version number (e.g. `1.2.3` -> `1.2.4`):
```bash
npm version patch
```
