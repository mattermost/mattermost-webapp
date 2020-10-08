// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @channel

describe('Archived channels', () => {
    before(() => {
        cy.apiUpdateConfig({
            TeamSettings: {
                ExperimentalViewArchivedChannels: true,
            },
        });

        // # Login as test user and visit created channel
        cy.apiInitSetup({loginAfter: true}).then(({team, channel}) => {
            cy.visit(`/${team.name}/channels/${channel.name}`);
        });
    });

    it('MM-T1719 Cannot add reactions to existing reactions', () => {
        const messageText = 'Test add reaction in archive channels';

        // * Post text box should be visible
        cy.get('#post_textbox').should('be.visible');

        // # Post a message in the channel
        cy.postMessage(messageText);

        // # Get the last post for reference of ID
        cy.getLastPostId().then((postId) => {
            // # Click the add reaction icon
            cy.clickPostReactionIcon(postId);

            // # Choose "slightly_frowning_face" emoji
            // delaying 500ms in case of lag
            // eslint-disable-next-line cypress/no-unnecessary-waiting
            cy.get('.emoji-picker__items #emoji-1f641').wait(500).click();

            // * Should have added the reaction with count
            cy.get(`#postReaction-${postId}-slightly_frowning_face .Reaction__number--display`).should('have.text', '1');

            // * Should have add reaction button
            cy.get(`#addReaction-${postId}`).should('exist');

            // # Archive the channel
            cy.uiArchiveChannel();

            // * Should not have add reaction button
            cy.get(`#addReaction-${postId}`).should('not.exist');

            // # Click on existing "slightly_frowning_face" emoji
            cy.get(`#postReaction-${postId}-slightly_frowning_face`).click();

            // * Reaction count should not have incremented
            cy.get(`#postReaction-${postId}-slightly_frowning_face .Reaction__number--display`).should('have.text', '1');

            // # Remove focus so we can open RHS
            cy.get('#channel_view').click();

            // # Open RHS for the post
            cy.clickPostCommentIcon(postId);

            cy.get(`#rhsPost_${postId}`).within(() => {
                // * Should not have add reaction button
                cy.get(`#addReaction-${postId}`).should('not.exist');

                // # Click on existing "slightly_frowning_face" emoji
                cy.get(`#postReaction-${postId}-slightly_frowning_face`).click();

                // * Reaction count should not have incremented
                cy.get(`#postReaction-${postId}-slightly_frowning_face .Reaction__number--display`).should('have.text', '1');
            });
        });
    });
});
