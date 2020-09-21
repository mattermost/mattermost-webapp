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
import * as MESSAGES from '../../fixtures/messages';

describe('Messaging', () => {
    before(() => {
        // # Login as test user and visit town-square
        cy.apiInitSetup({loginAfter: true}).then(({team}) => {
            cy.visit(`/${team.name}/channels/town-square`);
        });
    });

    it('At-mention user autocomplete should open below the textbox in RHS when only one message is present', () => {
        // # Add a single message to center textbox
        cy.postMessage(MESSAGES.TINY);

        // # Mouseover the last post and click post comment icon to open in RHS
        cy.clickPostCommentIcon();

        // * Check that the RHS is open
        cy.get('#rhsContainer').should('be.visible');

        // # Enter @ to allow opening of autocomplete box
        cy.get('#reply_textbox', {timeout: TIMEOUTS.HALF_MIN}).should('be.visible').clear().type('@');

        cy.get('#reply_textbox').then((replyTextbox) => {
            cy.get('#suggestionList').then((suggestionList) => {
                // * Verify that the suggestion box opened below the textbox
                expect(replyTextbox[0].getBoundingClientRect().top).to.be.lessThan(suggestionList[0].getBoundingClientRect().top);
            });
        });

        // # Close the RHS
        cy.closeRHS();
    });

    it('At-mention user autocomplete should open above the textbox in RHS is filled with messages', () => {
        // # Add a single message to center textbox
        cy.postMessage(MESSAGES.TINY);

        // # Mouseover the last post and click post comment icon to open in RHS
        cy.clickPostCommentIcon();

        // * Check that the RHS is open
        cy.get('#rhsContainer').should('be.visible');

        // # Make a series of post so we are way past the first message in terms of scroll
        cy.get('#reply_textbox').
            clear().
            invoke('val', MESSAGES.HUGE).
            wait(TIMEOUTS.ONE_SEC).
            type(' {backspace}{enter}');
        cy.get('#reply_textbox').
            clear().
            invoke('val', MESSAGES.HUGE).
            wait(TIMEOUTS.ONE_SEC).
            type(' {backspace}{enter}');

        // # Enter @ to allow opening of autocomplete box
        cy.get('#reply_textbox', {timeout: TIMEOUTS.HALF_MIN}).should('be.visible').clear().type('@');

        cy.get('#reply_textbox').then((replyTextbox) => {
            cy.get('#suggestionList').then((suggestionList) => {
                // * Verify that the suggestion box opened above the textbox
                expect(replyTextbox[0].getBoundingClientRect().top).to.be.greaterThan(suggestionList[0].getBoundingClientRect().top);
            });
        });

        // # Close the RHS
        cy.closeRHS();
    });

    it('MM-T70_1 At-mention user autocomplete is legible when it overlaps with channel header when drafting a long message containing a file attachment', () => {
        // # Upload file, add message, add mention, verify no overlap
        uploadFileAndAddAutocompleteThenVerifyNoOverlap();
    });

    it('MM-T70_2 At-mention user autocomplete is legible when it overlaps with channel header when drafting a long message containing a file attachment (1280x900 viewport)', () => {
        // # Set to different viewport
        cy.viewport(1280, 900);

        // # Upload file, add message, add mention, verify no overlap
        uploadFileAndAddAutocompleteThenVerifyNoOverlap();
    });
});

function uploadFileAndAddAutocompleteThenVerifyNoOverlap() {
    // # Upload file
    cy.get('#fileUploadInput').attachFile('mattermost-icon.png');

    // # Create and then type message to use
    cy.get('#post_textbox').clear();
    let message = 'h{shift}';
    for (let i = 0; i < 12; i++) {
        message += '{enter}h';
    }
    cy.get('#post_textbox').type(message);

    // # Add the mention
    cy.get('#post_textbox').type('{shift}{enter}').type('@');

    cy.get('#channel-header').should('be.visible').then((header) => {
        cy.get('#suggestionList').should('be.visible').then((list) => {
            // # Wait for suggestions to be fully loaded
            cy.wait(TIMEOUTS.HALF_SEC).then(() => {
                // * Suggestion list should visibly render just within the channel header
                cy.wrap(header[0].getBoundingClientRect().top).should('be.lt', list[0].getBoundingClientRect().top);
                cy.wrap(list[0]).findByText('Channel Members').then((channelMembers) => {
                    cy.wrap(header[0].getBoundingClientRect().bottom).should('be.lt', channelMembers[0].getBoundingClientRect().top);
                });
            });
        });
    });
}
