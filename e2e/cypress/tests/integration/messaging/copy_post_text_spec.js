// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// [#] indicates a test step (e.g. # Go to a page)
// [*] indicates an assertion (e.g. * Check the title)
// Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @messaging

import {stubClipboard} from '../../utils';

describe('Permalink message edit', () => {
    let testTeam;
    let testChannel;

    before(() => {
        cy.apiInitSetup().then(({team, channel}) => {
            testTeam = team;
            testChannel = channel;
        });
    });

    it('MM-T4688 Copy Text menu item should copy post message to clipboard', () => {
        stubClipboard().as('clipboard');

        // # Go to test channel
        cy.visit(`/${testTeam.name}/channels/${testChannel.name}`);
        cy.get('#channelHeaderTitle').should('be.visible').should('contain', testChannel.display_name || testChannel.name);

        // # Post a message
        const message = Date.now().toString();
        cy.postMessage(message);

        cy.getLastPostId().then((postId) => {
            // # Copy message by clicking
            cy.uiClickPostDropdownMenu(postId, 'Copy Text');

            // * Ensure that the clipboard contents are correct
            cy.get('@clipboard').its('wasCalled').should('eq', true);
            cy.location().then(() => {
                cy.get('@clipboard').its('contents').should('eq', message);
            });
        });

        // # Post another message
        const message2 = Date.now().toString();
        cy.postMessage(message2);

        cy.getLastPostId().then((postId) => {
            // # Copy by keyboard shortcut
            cy.clickPostDotMenu(postId, 'CENTER');
            cy.findAllByTestId(`post-menu-${postId}`).eq(0).type('c');

            // * Ensure that the clipboard contents are correct
            cy.get('@clipboard').its('wasCalled').should('eq', true);
            cy.location().then(() => {
                cy.get('@clipboard').its('contents').should('eq', message2);
            });
        });
    });
});
