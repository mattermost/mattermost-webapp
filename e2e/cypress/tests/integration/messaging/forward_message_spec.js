// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @messaging

import * as TIMEOUTS from '../../fixtures/timeouts';

const DEFAULT_CHARACTER_LIMIT = 16383;

describe('Forward Message', () => {
    let testUser;
    let otherUser;
    let testTeam;
    let testChannel;
    let otherChannel;
    let testPost;
    let replyPost;

    const message = 'Forward this message';
    const replyMessage = 'Forward this reply';

    /**
     * Verify that the post has been forwarded
     *
     * @param {string?} comment
     * @param {boolean?} showMore
     * @param {Post} post
     * @param {Team} team
     */
    const verifyForwardedMessage = ({post, comment, showMore}) => {
        const permaLink = `${Cypress.config('baseUrl')}/${testTeam.name}/pl/${post.id}`;

        // * Assert post has been forwarded
        cy.getLastPostId().then((id) => {
            // * Assert last post is visible
            cy.get(`#${id}_message`).should('be.visible').within(() => {
                if (comment) {
                    // * Assert the text in the post body is the permalink only
                    cy.get(`#postMessageText_${id}`).should('be.visible').should('contain.text', permaLink).should('contain.text', comment);

                    if (showMore) {
                        // * Assert show more button is rendered and works as expected
                        cy.get('#showMoreButton').should('be.visible').should('contain.text', 'Show more').click().should('contain.text', 'Show less').click();
                    }
                }

                // * Assert there is only one preview element rendered
                cy.get('.attachment.attachment--permalink').should('have.length', 1);

                // * Assert the text in the preview matches the original post message
                cy.get(`#postMessageText_${post.id}`).should('be.visible').should('contain.text', post.message);
            });
        });
    };

    /**
     * Forward Post with optional comment.
     * Has the possibility to also test for the post-error on long comments
     *
     * @param {string?} comment
     * @param {boolean?} testLongComment
     */
    const forwardPost = (comment = '', testLongComment = false) => {
        const permalink = `${Cypress.config('baseUrl')}/${testTeam.name}/pl/${testPost.id}`;
        const maxPostSize = DEFAULT_CHARACTER_LIMIT - permalink.length - 1;
        const longMessage = 'M'.repeat(maxPostSize);
        const extraChars = 'X';

        // * Assert visibility of the forward post modal
        cy.get('#forward-post-modal').should('be.visible').within(() => {
            // * Assert if button is disabled
            cy.get('.GenericModal__button.confirm').should('be.disabled');

            // * Assert visibility of channel select
            cy.get('.forward-post__select').should('be.visible').click();

            // # Select the testchannel to forward it to
            cy.get(`#post-forward_channel-select_option_${otherChannel.id}`).scrollIntoView().click();

            // * Assert that the testchannel is selected
            cy.get(`#post-forward_channel-select_singleValue_${otherChannel.id}`).should('be.visible');

            if (testLongComment) {
                // # Enter long comment and add one char to make it too long
                cy.get('#forward_post_textbox').invoke('val', longMessage).trigger('change').type(extraChars, {delay: 500});

                // * Assert if error message is shown
                cy.get('label.post-error').scrollIntoView().should('be.visible').should('contain', `Your message is too long. Character count: ${longMessage.length + extraChars.length}/${maxPostSize}`);

                // * Assert if button is disabled
                cy.get('.GenericModal__button.confirm').should('be.disabled');

                // # Enter a valid comment
                cy.get('#forward_post_textbox').invoke('val', longMessage).trigger('change').type(' {backspace}');

                // * Assert if error message is removed
                cy.get('label.post-error').should('not.exist');
            }

            if (comment) {
                // # Enter comment
                cy.get('#forward_post_textbox').invoke('val', comment).trigger('change').type(' {backspace}');

                // * Assert if error message is not present
                cy.get('label.post-error').should('not.exist');
            }

            // * Assert if button is active
            cy.get('.GenericModal__button.confirm').should('not.be.disabled').click();
        });
    };

    before(() => {
        cy.apiUpdateConfig({
            ServiceSettings: {
                ThreadAutoFollow: true,
                CollapsedThreads: 'default_on',
            },
        });

        // # Login as new user, create new team and visit its URL
        cy.apiInitSetup({loginAfter: true, promoteNewUserAsAdmin: true}).then(({
            user,
            team,
            channel,
        }) => {
            testUser = user;
            testTeam = team;
            testChannel = channel;

            // # enable CRT for the user
            cy.apiSaveCRTPreference(user.id, 'on');

            // # Create another user
            return cy.apiCreateUser({prefix: 'other'});
        }).then(({user}) => {
            otherUser = user;

            // # Add other user to team
            return cy.apiAddUserToTeam(testTeam.id, otherUser.id);
        }).then(() => {
            cy.apiAddUserToChannel(testChannel.id, otherUser.id);

            // # Post a sample message
            return cy.postMessageAs({sender: testUser, message, channelId: testChannel.id});
        }).then((post) => {
            testPost = post.data;

            // # Post a reply
            return cy.postMessageAs({sender: testUser, message: replyMessage, channelId: testChannel.id, rootId: testPost.id});
        }).then((post) => {
            replyPost = post.data;

            // # Create a second channel to forward to
            return cy.apiCreateChannel(testTeam.id, 'forward', 'Forward');
        }).then(({channel}) => {
            otherChannel = channel;

            // # Got to Test channel
            cy.visit(`/${testTeam.name}/channels/${testChannel.name}`);
        });
    });

    afterEach(() => {
        // # Go to 1. public channel
        cy.visit(`/${testTeam.name}/channels/${testChannel.name}`);
    });

    it('MM-T4934_1 Forward root post from public channel to another public channel', () => {
        // # Check if ... button is visible in last post right side
        cy.get(`#CENTER_button_${testPost.id}`).should('not.exist');

        // # Click on ... button of last post
        cy.clickPostDotMenu(testPost.id);

        // * Assert availability of the Forward menu-item
        cy.findByText('Forward').click();

        // # Forward Post
        forwardPost();

        // * Assert switch to testchannel
        cy.get('#channelHeaderTitle', {timeout: TIMEOUTS.HALF_MIN}).should('be.visible').should('contain', otherChannel.display_name);

        // * Assert post has been forwarded
        verifyForwardedMessage({post: testPost, team: testTeam});
    });

    it('MM-T4934_2 Forward root post from public channel to another public channel, long comment', () => {
        const longMessage = 'M'.repeat(6000);

        // # Check if ... button is visible in last post right side
        cy.get(`#CENTER_button_${testPost.id}`).should('not.exist');

        // # Click on ... button of last post
        cy.clickPostDotMenu(testPost.id);

        // * Assert availability of the Forward menu-item
        cy.findByText('Forward').click();

        // # Forward Post
        forwardPost(longMessage, true);

        // * Assert switch to testchannel
        cy.get('#channelHeaderTitle', {timeout: TIMEOUTS.HALF_MIN}).should('be.visible').should('contain', otherChannel.display_name);

        // * Assert post has been forwarded
        verifyForwardedMessage({post: testPost, team: testTeam, comment: longMessage, showMore: true});
    });

    it('MM-T4934_3 Forward reply post from public channel to another public channel', () => {
        // # Open the RHS with replies to the root post
        cy.uiClickPostDropdownMenu(testPost.id, 'Reply', 'CENTER');

        // * Assert RHS is open
        cy.get('#rhsContainer').should('be.visible');

        // # Click on ... button of reply post
        cy.clickPostDotMenu(replyPost.id, 'RHS_COMMENT');

        // * Assert availability of the Forward menu-item
        cy.findByText('Forward').click();

        // * Forward Post
        forwardPost();

        // * Assert switch to testchannel
        cy.get('#channelHeaderTitle', {timeout: TIMEOUTS.HALF_MIN}).should('be.visible').should('contain', otherChannel.display_name);

        // * Assert post has been forwarded
        verifyForwardedMessage({post: replyPost, team: testTeam});
    });

    it('MM-T4934_4 Forward public channel post from global threads', () => {
        // # Visit global threads
        cy.uiClickSidebarItem('threads');

        // # Open the RHS with replies to the root post
        cy.get('article.ThreadItem').should('have.lengthOf', 1).first().click();

        // # Click on ... button of reply post
        cy.clickPostDotMenu(replyPost.id, 'RHS_COMMENT');

        // * Assert availability of the Forward menu-item
        cy.findByText('Forward').click();

        // * Forward Post
        forwardPost();

        // * Assert switch to testchannel
        cy.get('#channelHeaderTitle', {timeout: TIMEOUTS.HALF_MIN}).should('be.visible').should('contain', otherChannel.display_name);

        // * Assert post has been forwarded
        verifyForwardedMessage({post: replyPost, team: testTeam});
    });
});
