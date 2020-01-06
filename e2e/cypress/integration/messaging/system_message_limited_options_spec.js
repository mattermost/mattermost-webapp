// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [number] indicates a test step (e.g. 1. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

import * as TIMEOUTS from '../../fixtures/timeouts';

describe('Messaging', () => {
    before(() => {
        // # Login and go to /
        cy.apiLogin('sysadmin');
        cy.visit('/ad-1/channels/town-square');
    });

    it('M17458 - System message limited options', () => {
        // # Update channel header to create a new system message
        cy.updateChannelHeader(Date.now());

        // # Get system message Id
        cy.getLastPostId().then((lastPostId) => {
            // # Mouse over the post to show the options
            cy.get(`#post_${lastPostId}`).trigger('mouseover', {force: true});
            cy.wait(TIMEOUTS.TINY);

            // * No option to reply this post
            cy.get(`#CENTER_commentIcon_${lastPostId}`).should('not.exist');

            // * No option to react to this post
            cy.get(`#CENTER_reaction_${lastPostId}`).should('not.exist');

            // # Click in the '...' button
            cy.get(`#CENTER_button_${lastPostId}`).click({force: true});
            cy.wait(TIMEOUTS.TINY);

            // # Get all list elements in the dropdown
            cy.get(`#CENTER_dropdown_${lastPostId}`).find('li').then((items) => {
                // * Must be only 1 element
                expect(items.length).to.equal(1);

                // * The element must be delete
                expect(items[0].id).to.equal(`delete_post_${lastPostId}`);
            });

            // # Log-in as a different user
            cy.apiLogin('user-1');
            cy.visit('/ad-1/channels/town-square');

            // # Mouse over the post to show the options
            cy.get(`#post_${lastPostId}`).trigger('mouseover', {force: true});
            cy.wait(TIMEOUTS.TINY);

            // * No option should appear
            cy.get(`#CENTER_commentIcon_${lastPostId}`).should('not.exist');
            cy.get(`#CENTER_reaction_${lastPostId}`).should('not.exist');
            cy.get(`#CENTER_button_${lastPostId}`).should('not.exist');
        });
    });
});