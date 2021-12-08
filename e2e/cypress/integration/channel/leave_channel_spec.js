// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @channel

import * as TIMEOUTS from '../../fixtures/timeouts';

describe('Leave channel', () => {
    let testTeam;
    let testUser;

    before(() => {
        cy.apiUpdateConfig({
            TeamSettings: {
                ExperimentalViewArchivedChannels: true,
            },
        });

        // # Login as test user and visit created channel
        cy.apiInitSetup().then(({team, user}) => {
            testUser = user;
            testTeam = team;

            cy.apiLogin(testUser);
            cy.apiCreateChannel(testTeam.id, 'channel', 'channel').then(({channel}) => {
                cy.visit(`/${testTeam.name}/channels/${channel.name}`);
            });
        });
    });

    it('Leave a channel while RHS is open', () => {
        // * Post text box should be visible
        cy.get('#post_textbox').should('be.visible');

        // # Post a message in the channel
        cy.postMessage('Test leave channel while RHS open');
        cy.getLastPostId().then((id) => {
            cy.clickPostCommentIcon(id);

            // * RHS should be visible
            cy.get('#rhsContainer').should('be.visible');

            // * RHS text box should be visible
            cy.get('#reply_textbox').should('be.visible');

            // # Archive the channel
            cy.uiLeaveChannel();
            cy.wait(TIMEOUTS.TWO_SEC); // eslint-disable-line cypress/no-unnecessary-waiting

            // * RHS should not be visible
            cy.get('#rhsContainer').should('not.exist');

            // * Assert that user is redirected to townsquare
            cy.url().should('include', '/channels/town-square');
            cy.get('#channelHeaderTitle').should('be.visible').and('contain', 'Town Square');
        });
    });
});
