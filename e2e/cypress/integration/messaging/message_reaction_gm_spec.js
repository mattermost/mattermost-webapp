// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod @smoke
// Group: @messaging

describe('Emoji reactions to posts/messages in GM channels', () => {
    let userOne;
    let userTwo;
    let testTeam;
    let testGroupChannel;

    before(() => {
        cy.apiInitSetup().then(({team, user}) => {
            testTeam = team;
            userOne = user;

            cy.apiCreateUser().then((data) => {
                userTwo = data.user;

                cy.apiAddUserToTeam(testTeam.id, userTwo.id);

                cy.apiCreateGroupChannel([userOne.id, userTwo.id]).then((response) => {
                    testGroupChannel = response.body;
                });

                // # Login as userOne and town-square
                cy.apiLogin(userOne);
                cy.visit(`/${testTeam.name}/channels/town-square`);
            });
        });
    });

    it('MM-T471 add a reaction to a message in a GM', () => {
        // # Switch to the GM
        cy.visit(`/${testTeam.name}/messages/${testGroupChannel.name}`);

        // # Post a message
        cy.postMessage('This is a post');

        // # Mouseover the last post
        cy.getLastPost().trigger('mouseover');

        cy.getLastPostId().then((postId) => {
            // # Click the add reaction icon
            cy.clickPostReactionIcon(postId);

            // # Choose "slightly_frowning_face" emoji
            // delaying 500ms in case of lag
            cy.get('.emoji-picker__items #emoji-1f641').wait(500).click();

            // * The number shown on the reaction is incremented by 1
            cy.get(`#postReaction-${postId}-slightly_frowning_face .Reaction__number--display`).
                should('have.text', '1').
                should('be.visible');
        });
    });
});
