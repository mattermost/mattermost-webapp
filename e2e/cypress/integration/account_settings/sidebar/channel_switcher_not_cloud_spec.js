// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @account_setting

describe('Account Settings > Sidebar > Channel Switcher', () => {
    let testUser;
    let testTeam;

    before(() => {
        // # Login as test user
        cy.apiInitSetup({loginAfter: true}).then(({team, user}) => {
            testUser = user;
            testTeam = team;
        });
    });

    beforeEach(() => {
        // # Visit town-square
        cy.visit(`/${testTeam.name}/channels/town-square`);
        cy.get('#channelHeaderTitle').should('be.visible').should('contain', 'Town Square');
    });

    it('Cmd/Ctrl+Shift+L closes Channel Switch modal and sets focus to post textbox', () => {
        // # Type CTRL/CMD+K
        cy.get('#post_textbox').cmdOrCtrlShortcut('K');

        // * Channel switcher hint should be visible
        cy.get('#quickSwitchHint').should('be.visible').should('contain', 'Type to find a channel. Use UP/DOWN to browse, ENTER to select, ESC to dismiss.');

        // # Type CTRL/CMD+shift+L
        cy.findByRole('textbox', {name: 'quick switch input'}).cmdOrCtrlShortcut('{shift}L');

        // * Suggestion list should be visible
        cy.get('#suggestionList').should('not.be.visible');

        // * focus should be on the input box
        cy.get('#post_textbox').should('be.focused');
    });

    it('Cmd/Ctrl+Shift+M closes Channel Switch modal and sets focus to mentions', () => {
        // # patch user info
        cy.apiPatchMe({notify_props: {first_name: 'false', mention_keys: testUser.username}});

        // # Type CTRL/CMD+K
        cy.get('#post_textbox').cmdOrCtrlShortcut('K');

        // * Channel switcher hint should be visible
        cy.get('#quickSwitchHint').should('be.visible').should('contain', 'Type to find a channel. Use UP/DOWN to browse, ENTER to select, ESC to dismiss.');

        // # Type CTRL/CMD+shift+m
        cy.findByRole('textbox', {name: 'quick switch input'}).cmdOrCtrlShortcut('{shift}M');

        // * Suggestion list should be visible
        cy.get('#suggestionList').should('not.be.visible');

        // * searchbox should appear
        cy.get('#searchBox').should('have.attr', 'value', `${testUser.username} @${testUser.username} `);
        cy.get('.sidebar--right__title').should('contain', 'Recent Mentions');
    });
});
