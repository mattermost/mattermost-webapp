// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @messaging

import * as TIMEOUTS from '../../fixtures/timeouts';

describe('Forward Message', () => {
    let testTeam;
    let testChannel;
    let testPostId;
    let testPostPermalink;
    let townSquareUrl;

    const message = 'Forward this message';

    before(() => {
        // # Login as new user, create new team and visit its URL
        cy.apiInitSetup({loginAfter: true}).then(({team, channel, townSquareUrl: tsUrl}) => {
            testTeam = team;
            testChannel = channel;
            townSquareUrl = tsUrl;
            cy.visit(townSquareUrl);

            // # Post a sample message
            cy.postMessage(message);

            // # Get last postid and store the permalink
            cy.getLastPostId().then((postId) => {
                testPostId = postId;
                testPostPermalink = `${Cypress.config('baseUrl')}/${testTeam.name}/pl/${postId}`;
            });
        });
    });

    afterEach(() => {
        cy.visit(townSquareUrl);
    });

    it('MM-14934_1 Forward  root post from public channel to another public channel', () => {
        // # Open the dotmenu
        cy.getLastPostId().then((postId) => {
            // # Check if ... button is visible in last post right side
            cy.get(`#CENTER_button_${postId}`).should('not.exist');

            // # Click on ... button of last post
            cy.clickPostDotMenu(postId);

            // * Assert availability of the Forward menu-item
            cy.findByText('Forward').click();

            // * Assert visibility of the forward post modal
            cy.get('#forward-post-modal').should('be.visible').within(() => {
                // * Assert if button is disabled
                cy.get('.GenericModal__button.confirm').should('be.disabled');

                // * Assert visibility of channel select
                cy.get('.forward-post__select').should('be.visible').click();

                // # Select the testchannel to forward it to
                cy.get(`#post-forward_channel-select_option_${testChannel.id}`).scrollIntoView().click();

                // * Assert that the testchannel is selected
                cy.get(`#post-forward_channel-select_singleValue_${testChannel.id}`).should('be.visible');

                // * Assert if button is active
                cy.get('.GenericModal__button.confirm').should('not.be.disabled');

                // # Forward the message
                cy.get('.GenericModal__button.confirm').click();
            });
        }).then(() => {
            // * Assert switch to testchannel
            cy.get('#channelHeaderTitle', {timeout: TIMEOUTS.HALF_MIN}).should('be.visible').should('contain', testChannel.display_name);

            // * Assert post has been forwarded
            cy.getLastPostId().then((id) => {
                // * Assert last post is visible
                cy.get(`#${id}_message`).should('be.visible').within(() => {
                    // * Assert the text in the post body is the permalink only
                    cy.get(`#postMessageText_${id}`).should('be.visible').should('contain.text', testPostPermalink);

                    // * Assert there is only one preview element rendered
                    cy.get('.attachment.attachment--permalink').should('have.length', 1);

                    // * Assert the text in the preview matches the original post message
                    cy.get(`#postMessageText_${testPostId}`).should('be.visible').should('contain.text', message);
                });
            });
        });
    });
});
