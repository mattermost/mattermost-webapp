// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

import * as TIMEOUTS from '../../fixtures/timeouts';

describe('Profile popover', () => {
    before(() => {
        // # Go to the top public channel with "user-1"
        cy.apiLogin('user-1');
        cy.toTopPublicChannelView();
        cy.viewport('iphone-6');
    });

    it('M18715 Profile popover should render', () => {
        cy.getLastPostId().then((postId) => {
            // add wait time to ensure image is rendered and can be clicked
            cy.wait(TIMEOUTS.TINY);

            // # Click on user profile image
            cy.get(`#post_${postId}`).find('.profile-icon > img').click();

            // * Popover should have rendered to screen
            cy.get('#user-profile-popover').should('be.visible');
        });
    });
});