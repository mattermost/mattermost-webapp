// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @commands

import * as TIMEOUTS from '../../fixtures/timeouts';

describe('Leave Channel Command', () => {
    before(() => {
        // # Login as test user and go to town-square
        cy.apiInitSetup({loginAfter: true}).then(({team}) => {
            cy.visit(`/${team.name}/channels/town-square`);
        });
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
                cy.wait(TIMEOUTS.TWO_SEC); // eslint-disable-line cypress/no-unnecessary-waiting

                // * Assert that user is redirected to townsquare
                cy.url().should('include', '/channels/town-square');
            });
        });
    });
});
