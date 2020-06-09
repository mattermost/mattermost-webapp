// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @multi_team_and_dm

import {getRandomId} from '../../utils';

function verifySystemMessage(post) {
    cy.get(post).
        invoke('attr', 'class').
        should('contain', 'post--system').
        and('not.contain', 'same--root').
        and('not.contain', 'other--root').
        and('not.contain', 'current--user').
        and('not.contain', 'post--comment').
        and('not.contain', 'post--root');

    cy.get(post).
        find('.status-wrapper .status svg').
        should('not.be.visible');
}

describe('System message', () => {
    before(() => {
        // # Login and go to /
        cy.apiLogin('user-1');
        cy.visit('/ad-1/channels/town-square');

        // # Post a regular message
        cy.postMessage('Test for no status of a system message');

        // # Update the header
        const newHeader = `Update header with ${getRandomId()}`;
        cy.getCurrentChannelId().then((channelId) => {
            cy.apiPatchChannel(
                channelId,
                {header: newHeader},
            );
        });

        // # Wait until the system message gets posted.
        cy.uiWaitUntilMessagePostedIncludes(newHeader);
    });

    const displayTypes = ['compact', 'clean'];

    displayTypes.forEach((type) => {
        it(`Mult15240 - should have no status with ${type} display`, () => {
            // # Set message display
            cy.apiSaveMessageDisplayPreference(type);

            // # Get last post
            cy.getLastPostId().then((postId) => {
                cy.get(`#post_${postId}`).as('SystemMessage');
            });

            // * Verify it is a system message and that the status icon is not visible
            verifySystemMessage('@SystemMessage');
        });
    });
});
