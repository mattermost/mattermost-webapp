// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod @smoke
// Group: @commands

describe('Leave Channel Command', () => {
    before(() => {
        // # Login and go to town-square
        cy.apiLogin();
        cy.visit('/ad-1/channels/town-square');
    });

    it('Should be redirected to last channel when user leaves channelw with /leave command', () => {
        cy.getCurrentTeamId().then((teamId) => {
            const channelName = 'newchannel' + Date.now();
            cy.apiCreateChannel(teamId, channelName, channelName).then((response) => {
                // # Go to newly created channel
                cy.get('#sidebarItem_' + response.body.name).click({force: true});
                cy.findAllByTestId('postView').should('be.visible');

                // # Post /leave command in center channel
                cy.postMessage('/leave');
                cy.wait(2000); // eslint-disable-line cypress/no-unnecessary-waiting

                // * Assert that user is redirected to townsquare
                cy.url().should('include', '/channels/town-square');
            });
        });
    });
});
