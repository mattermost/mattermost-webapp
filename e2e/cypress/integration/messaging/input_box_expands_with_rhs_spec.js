// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @messaging

import * as TIMEOUTS from '../../fixtures/timeouts';
import {getAdminAccount} from '../../support/env';

describe('Messaging', () => {
    const admin = getAdminAccount();

    before(() => {
        // # Log in as test user, go to test channel and post several messages
        cy.apiInitSetup({loginAfter: true}).then(({team, channel}) => {
            cy.visit(`/${team.name}/channels/${channel.name}`);

            Cypress._.times(30, (i) => {
                cy.postMessageAs({sender: admin, message: `[${i}]`, channelId: channel.id});
            });
        });
    });

    it('MM-T208 Input box on main thread can expand with RHS open', () => {
        // # Wait until site is loaded
        cy.wait(TIMEOUTS.FIVE_SEC);

        // # Open RHS
        cy.clickPostCommentIcon();

        // * Confirm the RHS is shown
        cy.get('#rhsCloseButton').should('exist');

        // # Get initial height of the post textbox
        cy.get('#post_textbox').should('be.visible').clear();
        cy.get('#post_textbox').then((post) => {
            cy.wrap(parseInt(post[0].clientHeight, 10)).as('previousHeight');
        });

        // # Scroll to latest post
        cy.getLastPostId().then((postId) => {
            cy.get(`#postMessageText_${postId}`).scrollIntoView();
        });

        // # Write lines until maximum height
        for (let i = 0; i < 13; i++) {
            // # Post the line
            cy.get('#post_textbox').type('{shift}{enter}');

            cy.get('#post_textbox').then((post) => {
                const height = parseInt(post[0].clientHeight, 10);

                // * Previous height should be lower than the current heigh
                cy.get('@previousHeight').should('be.lessThan', height);

                // # Store the current height as the previous height for the next loop
                cy.wrap(height).as('previousHeight');
            });
        }

        // * Check that height does not keep increasing.
        cy.get('#post_textbox').type('{shift}{enter}');
        cy.get('#post_textbox').then((post) => {
            const height = parseInt(post[0].clientHeight, 10);
            cy.get('@previousHeight').should('equal', height);
        });

        cy.getNthPostId(-1).then((postId) => {
            cy.get(`#postMessageText_${postId}`).should('be.visible');
        });

        // # Clear textbox to test from a different post
        cy.get('#post_textbox').should('be.visible').clear();

        // # Scroll to a previous post
        cy.getNthPostId(-29).then((postId) => {
            cy.get(`#postMessageText_${postId}`).scrollIntoView();
        });

        // # Write again all the long message
        for (let i = 0; i < 14; i++) {
            cy.get('#post_textbox').type('{shift}{enter}');
        }

        // * Previous post should be visible
        cy.getNthPostId(-29).then((postId) => {
            cy.get(`#postMessageText_${postId}`).should('be.visible');
        });
    });
});
