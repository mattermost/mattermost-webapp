Please make sure you've read the [pull request](http://docs.mattermost.com/developer/contribution-guide.html#preparing-a-pull-request) section of our [code contribution guidelines](http://docs.mattermost.com/developer/contribution-guide.html).

When filling in a section please remove the help text and the above text.

#### Summary
[A brief description of what this pull request does.]

#### Ticket Link
[Please link the GitHub issue or Jira ticket this PR addresses.]

#### Checklist
[Place an '[x]' (no spaces) in all applicable fields. Please remove unrelated fields.]
- [ ] Ran `make check-style` to check for style errors (required for all pull requests)
- [ ] Ran `make test` to ensure unit and component tests passed
- [ ] Added or updated unit tests (required for all new features)
- [ ] Has server changes (please link)
- [ ] Has redux changes (please link)
- [ ] Has UI changes
- [ ] Includes text changes and localization file ([.../i18n/en.json](https://github.com/mattermost/mattermost-webapp/blob/master/i18n/en.json)) updates
- [ ] Touches critical sections of the codebase (auth, posting, etc.)
