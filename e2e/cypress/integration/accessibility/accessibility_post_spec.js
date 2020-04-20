// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @accessibility

import users from '../../fixtures/users.json';

const otherUser = users['user-2'];
const currentUser = users.sysadmin;
let message;

function postMessages(count = 1) {
    cy.getCurrentChannelId().then((channelId) => {
        cy.apiGetUserByEmail(otherUser.email).then((emailResponse) => {
            cy.apiAddUserToChannel(channelId, emailResponse.body.id);
            for (let index = 0; index < count; index++) {
                // # Post Message as Current user
                message = `hello from sysadmin: ${Date.now()}`;
                cy.postMessage(message);
                message = `hello from ${otherUser.username}: ${Date.now()}`;
                cy.postMessageAs({sender: otherUser, message, channelId});
            }
            cy.wait(1000); // eslint-disable-line cypress/no-unnecessary-waiting
        });
    });
}

function postAndPerformActions() {
    postMessages();

    // # Take some actions on the last post
    cy.getLastPostId().then((postId) => {
        // # Add couple of Reactions
        cy.clickPostReactionIcon(postId);
        cy.findByTestId('grinning').click();
        cy.clickPostReactionIcon(postId);
        cy.findByTestId('smile').click();

        // # Flag the post
        cy.clickPostFlagIcon(postId);

        // # Pin the post
        cy.clickPostDotMenu(postId);
        cy.get(`#pin_post_${postId}`).click();

        cy.clickPostDotMenu(postId);
        cy.get('body').type('{esc}');
    });
}

function verifyPostLabel(elementId, username, labelSuffix) {
    // # Shift focus to the last post
    cy.get(elementId).as('lastPost').should('have.class', 'a11y--active a11y--focused');

    // * Verify reader reads out the post correctly
    cy.get('@lastPost').then((el) => {
        // # Get the post time
        cy.wrap(el).find('time.post__time').invoke('text').then((time) => {
            const expectedLabel = `At ${time} ${Cypress.moment().format('dddd, MMMM D')}, ${username} ${labelSuffix}`;
            cy.wrap(el).should('have.attr', 'aria-label', expectedLabel);
        });
    });
}

describe('Verify Accessibility Support in Post', () => {
    before(() => {
        cy.apiLogin('sysadmin');

        // # Update Configs
        cy.apiUpdateConfig({
            ServiceSettings: {
                ExperimentalChannelOrganization: false,
            },
        });
    });

    beforeEach(() => {
        // # Visit the Town Square channel
        cy.visit('/ad-1/channels/off-topic');
        cy.get('#postListContent').should('be.visible');
    });

    it('MM-22631 Verify Reader reads out the post correctly on Center Channel', () => {
        postAndPerformActions();

        // # Shift focus to the last post
        cy.get('#fileUploadButton').focus().tab({shift: true}).tab({shift: true});
        cy.get('body').type('{uparrow}{downarrow}');

        // * Verify post message in Center Channel
        cy.getLastPostId().then((postId) => {
            // * Verify reader reads out the post correctly
            verifyPostLabel(`#post_${postId}`, otherUser.username, `wrote, ${message}, 2 reactions, message is flagged and pinned`);
        });
    });

    it('MM-22631 Verify Reader reads out the post correctly on RHS', () => {
        postAndPerformActions();

        // # Post a reply on RHS
        cy.getLastPostId().then((postId) => {
            cy.clickPostCommentIcon(postId);
            cy.get('#rhsContainer').should('be.visible');
            const replyMessage = 'A reply to an older post';
            cy.postMessageReplyInRHS(replyMessage);

            // * Verify post message in RHS
            cy.get('#rhsContainer').within(() => {
                // # Shift the focus to the last post
                cy.get('#fileUploadButton').focus().tab({shift: true}).tab({shift: true}).type('{uparrow}');

                // * Verify reader reads out the post correctly
                verifyPostLabel(`#rhsPost_${postId}`, otherUser.username, `wrote, ${message}, 2 reactions, message is flagged and pinned`);
            });

            // * Verify reply message in RHS
            cy.getLastPostId().then((replyId) => {
                cy.get('#rhsContainer').within(() => {
                    // # Shift the focus to the last reply message
                    cy.get('#fileUploadButton').focus().tab({shift: true}).tab({shift: true}).type('{uparrow}{downarrow}');

                    // * Verify reader reads out the post correctly
                    verifyPostLabel(`#rhsPost_${replyId}`, currentUser.username, `replied, ${replyMessage}`);
                });
            });
        });
    });

    it('MM-22631 Verify different Post Focus on Center Channel', () => {
        postMessages(5);

        // # Shift focus to the last post
        cy.get('#fileUploadButton').focus().tab({shift: true}).tab({shift: true}).type('{uparrow}');

        // * Verify if focus changes to different posts when we use up arrows
        for (let index = 1; index < 5; index++) {
            cy.getNthPostId(-index - 1).then((postId) => {
                cy.get(`#post_${postId}`).should('have.class', 'a11y--active a11y--focused');
                cy.get('body').type('{uparrow}');
            });
        }

        // * Verify if focus changes to different posts when we use down arrows
        for (let index = 5; index > 0; index--) {
            cy.getNthPostId(-index - 1).then((postId) => {
                cy.get(`#post_${postId}`).should('have.class', 'a11y--active a11y--focused');
                cy.get('body').type('{downarrow}');
            });
        }
    });

    it('MM-22631 Verify different Post Focus on RHS', () => {
        // # Post Message as Current user
        message = `hello from sysadmin: ${Date.now()}`;
        cy.postMessage(message);

        // # Post few replies on RHS
        cy.getLastPostId().then((postId) => {
            cy.clickPostCommentIcon(postId);
            cy.get('#rhsContainer').should('be.visible');
            cy.getCurrentChannelId().then((channelId) => {
                for (let index = 0; index < 3; index++) {
                    const replyMessage = `A reply ${Date.now()}`;
                    cy.postMessageReplyInRHS(replyMessage);
                    message = `reply from ${otherUser.username}: ${Date.now()}`;
                    cy.postMessageAs({sender: otherUser, message, channelId, rootId: postId});
                }
            });
        });

        cy.get('#rhsContainer').within(() => {
            // # Shift focus to the last post
            cy.get('#fileUploadButton').focus().tab({shift: true}).tab({shift: true}).type('{uparrow}');
        });

        // * Verify if focus changes to different posts when we use up arrows
        for (let index = 1; index < 5; index++) {
            cy.getNthPostId(-index - 1).then((postId) => {
                cy.get(`#rhsPost_${postId}`).should('have.class', 'a11y--active a11y--focused');
                cy.get('body').type('{uparrow}');
            });
        }

        // * Verify if focus changes to different posts when we use down arrows
        for (let index = 5; index > 1; index--) {
            cy.getNthPostId(-index - 1).then((postId) => {
                cy.get(`#rhsPost_${postId}`).should('have.class', 'a11y--active a11y--focused');
                cy.get('body').type('{downarrow}');
            });
        }
    });

    it('MM-22631 Verify Tab support on Post on Center Channel', () => {
        postMessages();

        // # Shift focus to the last post
        cy.get('#fileUploadButton').focus().tab({shift: true}).tab({shift: true});
        cy.get('body').type('{uparrow}{downarrow}');
        cy.focused().tab();

        cy.getLastPostId().then((postId) => {
            cy.get(`#post_${postId}`).within(() => {
                // * Verify focus is on the username
                cy.get('button.user-popover').should('have.class', 'a11y--active a11y--focused').and('have.attr', 'aria-label', otherUser.username);
                cy.focused().tab();

                // * Verify focus is on the time
                cy.get(`#CENTER_time_${postId}`).should('have.class', 'a11y--active a11y--focused');
                cy.focused().tab();

                // * Verify focus is on the flag icon
                cy.get(`#CENTER_flagIcon_${postId}`).should('have.class', 'a11y--active a11y--focused').and('have.attr', 'aria-label', 'flag for follow up');
                cy.focused().tab();

                // * Verify focus is on the actions button
                cy.get(`#CENTER_button_${postId}`).should('have.class', 'a11y--active a11y--focused').and('have.attr', 'aria-label', 'more actions');
                cy.focused().tab();

                // * Verify focus is on the reactions button
                cy.get(`#CENTER_reaction_${postId}`).should('have.class', 'a11y--active a11y--focused').and('have.attr', 'aria-label', 'add reaction');
                cy.focused().tab();

                // * Verify focus is on the comment button
                cy.get(`#CENTER_commentIcon_${postId}`).should('have.class', 'a11y--active a11y--focused').and('have.attr', 'aria-label', 'reply');
                cy.focused().tab();

                // * Verify focus is on the post text
                cy.get(`#postMessageText_${postId}`).should('have.class', 'a11y--active a11y--focused').and('have.attr', 'aria-readonly', 'true');
            });
        });
    });

    it('MM-22631 Verify Tab support on Post on RHS', () => {
        // # Post Message as Current user
        message = `hello from sysadmin: ${Date.now()}`;
        cy.postMessage(message);

        // # Post few replies on RHS
        cy.getLastPostId().then((postId) => {
            cy.clickPostCommentIcon(postId);
            cy.get('#rhsContainer').should('be.visible');
            cy.getCurrentChannelId().then((channelId) => {
                const replyMessage = `A reply ${Date.now()}`;
                cy.postMessageReplyInRHS(replyMessage);
                message = `reply from ${otherUser.username}: ${Date.now()}`;
                cy.postMessageAs({sender: otherUser, message, channelId, rootId: postId});
            });
        });

        cy.get('#rhsContainer').within(() => {
            // # Shift focus to the last post
            cy.get('#fileUploadButton').focus().tab({shift: true}).tab({shift: true});
        });

        // * Verify reverse tab on RHS
        cy.getLastPostId().then((postId) => {
            cy.get(`#rhsPost_${postId}`).within(() => {
                // * Verify focus is on the post text
                cy.get(`#rhsPostMessageText_${postId}`).should('have.class', 'a11y--active a11y--focused').and('have.attr', 'aria-readonly', 'true');
                cy.focused().tab({shift: true});

                // * Verify focus is on the reactions button
                cy.get(`#RHS_COMMENT_reaction_${postId}`).should('have.class', 'a11y--active a11y--focused').and('have.attr', 'aria-label', 'add reaction');
                cy.focused().tab({shift: true});

                // * Verify focus is on the actions button
                cy.get(`#RHS_COMMENT_button_${postId}`).should('have.class', 'a11y--active a11y--focused').and('have.attr', 'aria-label', 'more actions');
                cy.focused().tab({shift: true});

                // * Verify focus is on the flag icon
                cy.get(`#RHS_COMMENT_flagIcon_${postId}`).should('have.class', 'a11y--active a11y--focused').and('have.attr', 'aria-label', 'flag for follow up');
                cy.focused().tab({shift: true});

                // * Verify focus is on the time
                cy.get(`#RHS_COMMENT_time_${postId}`).should('have.class', 'a11y--active a11y--focused');
                cy.focused().tab({shift: true});

                // * Verify focus is on the username
                cy.get('button.user-popover').should('have.class', 'a11y--active a11y--focused').and('have.attr', 'aria-label', otherUser.username);
                cy.focused().tab({shift: true});
            });
        });
    });
});
