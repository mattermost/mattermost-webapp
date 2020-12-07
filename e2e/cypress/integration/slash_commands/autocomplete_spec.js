// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @not_cloud @integrations

describe('Integrations', () => {
    const pluginIdDemo = 'com.mattermost.demo-plugin';
    const pluginIdJira = 'jira';

    before(() => {
        cy.shouldNotRunOnCloudEdition();
        cy.shouldHavePluginUploadEnabled();

        // # Initialize setup and visit town-square
        cy.apiInitSetup().then(({team}) => {
            cy.visit(`/${team.name}/channels/town-square`);

            // # If Demo plugin is already enabled, uninstall it
            cy.apiRemovePluginById(pluginIdDemo, true);
            cy.apiRemovePluginById(pluginIdJira, true);
        });

        const demoURL = 'https://github.com/mattermost/mattermost-plugin-demo/releases/download/v0.9.0/com.mattermost.demo-plugin-0.9.0.tar.gz';
        const jiraURL = 'https://github.com/mattermost/mattermost-plugin-jira/releases/download/v3.0.0/jira-3.0.0.tar.gz';

        cy.apiInstallPluginFromUrl(demoURL, true);
        cy.apiInstallPluginFromUrl(jiraURL, true);

        cy.apiUpdateConfig({
            PluginSettings: {
                PluginStates: {
                    jira: {
                        Enable: true,
                    },
                    'com.mattermost.demo-plugin': {
                        Enable: true,
                    },
                },
            },
        });
    });

    after(() => {
        cy.apiRemovePluginById(pluginIdDemo);
        cy.apiRemovePluginById(pluginIdJira);
    });

    it('MM-T2829 Test an example of plugin that uses sub commands', () => {
        // # Post a slash command with trailing space
        cy.get('#post_textbox').clear().type('/jira ');

        // * Verify suggestion list is visible and includes 'info'
        cy.get('#suggestionList').findByText('info').scrollIntoView().should('be.visible');

        // # Narrow down list to show info only suggestion
        cy.get('#post_textbox').type('inf');

        // * Verify suggestion list is visible with only 1 child
        cy.get('#suggestionList').should('be.visible').children().should('have.length', 1);

        // * Verify list is refined to only the info sub command
        cy.get('#suggestionList').findByText('info').should('be.visible');

        // # click the info subcommand and hit enter
        cy.get('#suggestionList').findByText('info').should('be.visible').click();
        cy.get('#post_textbox').type('{enter}');

        // * Verify message is sent and (only visible to you)
        cy.getLastPostId().then((postId) => {
            cy.get(`#post_${postId}`).
                should('contain.text', '(Only visible to you)').
                should('contain.text', 'is not a valid Mattermost SITEURL.');
        });
    });

    it('MM-T2830 Test an example of a plugin using static list', () => {
        // # Post a slash command with trailing space
        cy.get('#post_textbox').clear().type('/jira ');

        // * Verify suggestion includes instance subcommand and is visible
        cy.get('#suggestionList').should('contain.text', 'instance').scrollIntoView().should('be.visible');

        // # Narrow down list to show info only suggestion
        cy.get('#post_textbox').type('i');

        // * Verify suggestion list is visible with three children (issue, instance, info)
        cy.get('#suggestionList').should('be.visible').children().
            should('contain.text', 'issue').
            should('contain.text', 'instance').
            should('contain.text', 'info');

        // # Clear test and post a slash command with trailing space
        cy.get('#post_textbox').clear().type('/jira instance settings ');

        // * Verify suggestion notifications is visible
        cy.get('#suggestionList').should('contain.text', 'notifications').scrollIntoView().should('be.visible');

        // # Clear test and Post a slash command with trailing space
        cy.get('#post_textbox').type('notifications ');

        // * Verify notifications suggestion is visible and lists on/off options
        cy.get('#suggestionList').should('be.visible').children().
            should('contain.text', 'on').
            should('contain.text', 'off');

        // # down arrow to highlight the second suggestion
        // # enter to push to send command to post textbox
        cy.get('#post_textbox').type('{downarrow}{downarrow}{enter}');

        // # Send the command
        cy.get('#post_textbox').type('{enter}');

        // * Verify message is sent and (only visible to you)
        cy.getLastPostId().then((postId) => {
            cy.get(`#post_${postId}`).
                should('contain.text', '(Only visible to you)').
                should('contain.text', 'is not a valid Mattermost SITEURL.');
        });
    });

    it('MM-T2831 Test an example of plugin using dynamic list', () => {
        // # Post a slash command with trailing space
        cy.get('#post_textbox').clear().type('/autocomplete_test dynamic-arg ');

        // * Verify suggestion list is visible with at three children (issue, instance, info)
        cy.get('#suggestionList').should('be.visible').children().
            should('contain.text', 'suggestion 1 (hint)').
            should('contain.text', 'suggestion 2 (hint)');

        // # down arrow to highlight the second suggestion
        // # enter to push to send command to post textbox
        cy.get('#post_textbox').type('{downarrow}{downarrow}{enter}');

        // # Send the command
        cy.get('#post_textbox').type('{enter}');

        // * Verify correct message is sent,  (only visible to you)
        cy.getLastPostId().then((postId) => {
            cy.get(`#post_${postId}`).
                should('contain.text', '(Only visible to you)').
                should('contain.text', 'Executed command: /autocomplete_test dynamic-arg suggestion 2');
        });
    });

    it('MM-T2832 Use a slash command that omits the optional argument', () => {
        // # Post a slash command that omits the optional argument
        cy.get('#post_textbox').clear().type('/autocomplete_test optional-arg {enter}');

        // * Verify item is sent and is (only visible to you)
        cy.getLastPostId().then((postId) => {
            cy.get(`#post_${postId}`).contains('Executed command: /autocomplete_test optional-arg');
        });
    });

    it('MM-T2833 Use a slash command that accepts an optional argument', () => {
        // # Post a slash command that accepts an optional argument
        cy.get('#post_textbox').clear().type('/autocomplete_test optional-arg --name1 testarg {enter}');

        // * Verify item is sent and is (only visible to you)
        cy.getLastPostId().then((postId) => {
            cy.get(`#post_${postId}`).contains('Executed command: /autocomplete_test optional-arg --name1 testarg');
        });
    });

    it('MM-T2834 Slash command help stays visible for system slash command', () => {
        // # Post a slash command without trailing space
        cy.get('#post_textbox').type('/rename');

        // * Verify suggestion list is visible with only 1 child
        cy.get('#suggestionList').should('be.visible').children().should('have.length', 1);

        // * Verify suggestion list is visible
        cy.get('#suggestionList').children().eq(0).findByText('Rename the channel').should('be.visible');

        // # Add trailing space to '/rename' command
        cy.get('#post_textbox').type(' ');

        // * Verify command text is no longer visible after space is added
        cy.findByText('Rename the channel').should('not.be.visible');

        // * Verify suggestion list is visible with 2 children
        cy.get('#suggestionList').should('be.visible').children().should('have.length', 2);

        // * Verify execute current command text shows in first element
        cy.get('#suggestionList').children().eq(0).findByText('Execute Current Command').should('be.visible');

        // * After typing the space character the relevant tip is still displayed
        cy.get('.slash-command__desc').contains('[text]').should('be.visible');
    });

    it('MM-T2835 Slash command help stays visible for plugin', () => {
        // # Post a slash command with trailing space
        cy.get('#post_textbox').clear().type('/jira ');

        // * Verify suggestion list is visible with 11 children
        cy.get('#suggestionList').should('be.visible').children().should('have.length', 11);
    });
});
