// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @channel @smoke

describe('Channel Switcher', () => {
    let testTeam;
    const channelNamePrefix = 'achannel';
    const channelDisplayNamePrefix = 'ASwitchChannel';

    before(() => {
        cy.apiInitSetup({channelPrefix: {name: `${channelNamePrefix}-a`, displayName: `${channelDisplayNamePrefix} A`}}).then(({team, user}) => {
            testTeam = team;

            // # Add some channels
            cy.apiCreateChannel(testTeam.id, `${channelNamePrefix}-b`, `${channelDisplayNamePrefix} B`, 'O');
            cy.apiCreateChannel(testTeam.id, `${channelNamePrefix}-c`, `${channelDisplayNamePrefix} C`, 'O');

            // # Login as test user and go to town square
            cy.apiLogin(user);
            cy.visit(`/${team.name}/channels/town-square`);
        });
    });

    it('MM-T2031_1 - should switch channels by keyboard', () => {
        // # Press CTRL+K (Windows) or CMD+K(Mac)
        cy.typeCmdOrCtrl().type('K', {release: true});

        // # Start typing channel name in the "Switch Channels" modal message box
        // # Use up/down arrow keys to highlight second channel
        // # Press ENTER
        cy.get('#quickSwitchInput').type(`${channelDisplayNamePrefix} `).type('{downarrow}').type('{downarrow}').type('{enter}');

        // * Expect channel title to match title
        cy.get('#channelHeaderTitle').
            should('be.visible').
            and('contain.text', `${channelDisplayNamePrefix} B`);

        // * Expect url to match url
        cy.url().should('contain', `${channelNamePrefix}-b`);
    });

    it('MM-T2031_2 - should switch channels by mouse', () => {
        // # Press CTRL+K (Windows) or CMD+K(Mac)
        cy.typeCmdOrCtrl().type('K', {release: true});

        // # Start typing channel name in the "Switch Channels" modal message box
        cy.get('#quickSwitchInput').type(`${channelDisplayNamePrefix} `);

        cy.get(`[data-testid^=${channelNamePrefix}-c] > span`).click();

        // * Expect channel title to match title
        cy.get('#channelHeaderTitle').
            should('be.visible').
            and('contain.text', `${channelDisplayNamePrefix} C`);

        // * Expect url to match url
        cy.url().should('contain', `${channelNamePrefix}-c`);
    });

    it('MM-T2031_3 - should show empty result', () => {
        // # Press CTRL+K (Windows) or CMD+K(Mac)
        cy.typeCmdOrCtrl().type('K', {release: true});

        // # Type invalid channel name in the "Switch Channels" modal message box
        cy.get('#quickSwitchInput').type('there-is-no-spoon');

        // * Expect 'nothing found' message
        cy.get('.no-results__title > span').should('be.visible');
    });

    it('MM-T2031_4 - should close on esc and outside click', () => {
        cy.visit(`/${testTeam.name}/channels/town-square`);

        // # Press CTRL+K (Windows) or CMD+K(Mac)
        cy.typeCmdOrCtrl().type('K', {release: true});

        // # Press ESC
        cy.get('#quickSwitchInput').type('{esc}');

        // * Expect the dialog to be closed
        cy.get('#quickSwitchInput').should('not.exist');

        // * Expect staying in the same channel
        cy.url().should('contain', 'town-square');

        // # Press CTRL+K (Windows) or CMD+K(Mac)
        cy.typeCmdOrCtrl().type('K', {release: true});

        // # Click outside of the modal
        cy.get('.modal').click({force: true});

        // * Expect the dialog to be closed
        cy.get('#quickSwitchInput').should('not.exist');

        // * Expect staying in the same channel
        cy.url().should('contain', 'town-square');
    });
});
