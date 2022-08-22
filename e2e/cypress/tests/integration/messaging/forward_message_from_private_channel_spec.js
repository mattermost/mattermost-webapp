// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @enterprise @messaging

import * as TIMEOUTS from '../../fixtures/timeouts';

const DEFAULT_CHARACTER_LIMIT = 16383;

describe('Forward Message', () => {
    let user1;
    let user2;
    let user3;
    let testTeam;
    let testChannel;
    let otherChannel;
    let privateChannel;
    let dmChannel;
    let gmChannel;
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

                // # Cleanup
                cy.apiDeletePost(id);
            });
        });
    };

    /**
     * Forward Post with optional comment.
     * Has the possibility to also test for the post-error on long comments
     *
     * @param {boolean?} cancel
     */
    const forwardPostFromPrivateChannel = (cancel = false) => {
        // * Assert visibility of the forward post modal
        cy.get('#forward-post-modal').should('be.visible').within(() => {
            // * Assert if button is disabled
            cy.get('.GenericModal__button.confirm').should('not.be.disabled');

            // * Assert Notificatio is shown
            cy.findByTestId('notification_forward_post').should('be.visible').should('contain.text', `This message is from a private channel and can only be shared with ~${privateChannel.display_name}`);

            if (cancel) {
                // * Assert if button is active
                cy.get('.GenericModal__button.cancel').should('not.be.disabled').click();
            } else {
                // * Assert if button is active
                cy.get('.GenericModal__button.confirm').should('not.be.disabled').click();
            }
        });
    };

    before(() => {
        // # Testing Forwarding from Insights view requires a license
        cy.apiRequireLicense();
        cy.shouldHaveFeatureFlag('InsightsEnabled', true);

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
            user1 = user;
            testTeam = team;
            testChannel = channel;

            // # enable CRT for the user
            cy.apiSaveCRTPreference(user.id, 'on');

            // # Create another user
            return cy.apiCreateUser({prefix: 'second'});
        }).then(({user}) => {
            user2 = user;

            // # Add other user to team
            return cy.apiAddUserToTeam(testTeam.id, user2.id);
        }).then(() => {
            // # Create another user
            return cy.apiCreateUser({prefix: 'third'});
        }).then(({user}) => {
            user3 = user;

            // # Add other user to team
            return cy.apiAddUserToTeam(testTeam.id, user3.id);
        }).then(() => {
            cy.apiAddUserToChannel(testChannel.id, user2.id);
            cy.apiAddUserToChannel(testChannel.id, user3.id);

            // # Create new DM channel
            return cy.apiCreateDirectChannel([user1.id, user2.id]);
        }).then(({channel}) => {
            dmChannel = channel;

            // # Create new DM channel
            return cy.apiCreateGroupChannel([user1.id, user2.id, user3.id]);
        }).then(({channel}) => {
            gmChannel = channel;

            // # Create a private channel to forward to
            return cy.apiCreateChannel(testTeam.id, 'private', 'Private', 'P');
        }).then(({channel}) => {
            privateChannel = channel;

            // # Create a second channel to forward to
            return cy.apiCreateChannel(testTeam.id, 'forward', 'Forward');
        }).then(({channel}) => {
            otherChannel = channel;

            // # Post a sample message
            return cy.postMessageAs({sender: user1, message, channelId: privateChannel.id});
        }).then((post) => {
            testPost = post.data;

            // # Post a reply
            return cy.postMessageAs({sender: user1, message: replyMessage, channelId: privateChannel.id, rootId: testPost.id});
        }).then((post) => {
            replyPost = post.data;

            // # Got to Private channel
            cy.visit(`/${testTeam.name}/channels/${privateChannel.name}`);
        });
    });

    afterEach(() => {
        // # Go to 1. public channel
        cy.visit(`/${testTeam.name}/channels/${privateChannel.name}`);
    });

    it('MM-T4935_1 Forward root post from private channel', () => {
        // # Check if ... button is visible in last post right side
        cy.get(`#CENTER_button_${testPost.id}`).should('not.exist');

        // # Click on ... button of last post
        cy.clickPostDotMenu(testPost.id);

        // * Assert availability of the Forward menu-item
        cy.findByText('Forward').type('{shift}F');

        // # Forward Post
        forwardPostFromPrivateChannel();

        // * Assert switch to testchannel
        cy.get('#channelHeaderTitle', {timeout: TIMEOUTS.HALF_MIN}).should('be.visible').should('contain', privateChannel.display_name);

        // * Assert post has been forwarded
        verifyForwardedMessage({post: testPost});
    });

    it('MM-T4935_2 Forward reply post from private channel', () => {
        // # Open the RHS with replies to the root post
        cy.uiClickPostDropdownMenu(testPost.id, 'Reply', 'CENTER');

        // * Assert RHS is open
        cy.get('#rhsContainer').should('be.visible');

        // # Click on ... button of reply post
        cy.clickPostDotMenu(replyPost.id, 'RHS_COMMENT');

        // * Assert availability of the Forward menu-item
        cy.findByText('Forward').type('{shift}F');

        // # Forward Post
        forwardPostFromPrivateChannel();

        // * Assert switch to testchannel
        cy.get('#channelHeaderTitle', {timeout: TIMEOUTS.HALF_MIN}).should('be.visible').should('contain', privateChannel.display_name);

        // * Assert post has been forwarded
        verifyForwardedMessage({post: replyPost});
    });

    it('MM-T4935_3 Forward post from private channel - Cancel', () => {
        // # Check if ... button is visible in last post right side
        cy.get(`#CENTER_button_${testPost.id}`).should('not.exist');

        // # Click on ... button of last post
        cy.clickPostDotMenu(testPost.id);

        // * Assert availability of the Forward menu-item
        cy.findByText('Forward').type('{shift}F');

        // # Forward Post
        forwardPostFromPrivateChannel(true);

        // * Assert switch to testchannel
        cy.get('#channelHeaderTitle', {timeout: TIMEOUTS.HALF_MIN}).should('be.visible').should('contain', privateChannel.display_name);

        // * Assert last post id is identical with testPost
        cy.getLastPostId((id) => {
            assert.isEqual(id, testPost.id);
        });
    });
});
