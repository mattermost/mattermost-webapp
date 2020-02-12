// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// # Indicates a test step (e.g. # Go to a page)
// [*] indicates an assertion (e.g. * Check the title)
// Use element ID when selecting an element. Create one if none.
// ***************************************************************

import users from '../../fixtures/users.json';

const otherUser = users['user-2'];
let townsquareChannelId;

describe('toasts', () => {
    before(() => {
        cy.toMainChannelView();
        cy.visit('/ad-1/channels/town-square');
        cy.getCurrentChannelId().then((id) => {
            townsquareChannelId = id;
        });
    });

    beforeEach(() => {
        cy.visit('/ad-1/channels/town-square');
        cy.visit('/ad-1/channels/off-topic');
    });

    it('Unread messages toast is show when visiting a channel with unreads and should dissapear if scrolled to bottom', () => {
        // # Add enough messages
        for (let index = 0; index < 30; index++) {
            cy.postMessageAs({sender: otherUser, message: `This is an old message [${index}]`, channelId: townsquareChannelId});
        }

        visitTownSquareAndWaitForPageToLoad();

        // * find the toast
        cy.get('div.toast').should('be.visible');

        // * check that the message is correct
        cy.get('div.toast__message>span').first().contains('30 new messages');
        cy.get('div.post-list__dynamic').scrollTo('bottom', {duration: 1000});

        // * should hide the scroll to new message button as it is at the bottom
        cy.get('div.toast__jump').should('not.be.visible');

        // * As time elapsed the toast should be hidden
        cy.get('div.toast').should('be.not.visible');
    });

    it('should show new message indicator when posts arrive and user is not at bottom', () => {
        visitTownSquareAndWaitForPageToLoad();
        scrollUpAndPostAMessage().then(() => {
            // * find the toast
            cy.get('div.toast').should('be.visible');

            // * check that the message is correct
            cy.get('div.toast__message>span').first().contains('1 new message');
        });
    });

    it('New message toast should not have action button when at bottom and hide toast in a sec', () => {
        visitTownSquareAndWaitForPageToLoad();
        scrollUpAndPostAMessage().then(() => {
            // * find the toast
            cy.get('div.toast').should('be.visible');
            cy.get('div.post-list__dynamic').scrollTo('bottom', {duration: 1000});

            // * should hide the scroll to new message button as it is at the bottom
            cy.get('div.toast__jump').should('not.be.visible');

            // * As time elapsed the toast should be hidden
            cy.get('div.toast').should('be.hidden');
        });
    });

    it('new message toast should take to new messages line when clicked', () => {
        visitTownSquareAndWaitForPageToLoad();

        // # Scroll up so bottom is not visible
        scrollUp();

        // # Post few new message
        for (let index = 0; index < 4; index++) {
            cy.postMessageAs({sender: otherUser, message: `This is a new message [${index}]`, channelId: townsquareChannelId});
        }

        cy.get('.NotificationSeparator').should('not.be.visible');
        cy.get('div.toast__pointer').should('be.visible').click();

        // * should scroll NotificationSeparator into view
        cy.get('.NotificationSeparator').should('be.visible');
    });

    it('Unread messages toast should take to bottom when clicked', () => {
        // # Add enough messages
        for (let index = 0; index < 40; index++) {
            cy.postMessageAs({sender: otherUser, message: `This is a message for checking action on toast [${index}]`, channelId: townsquareChannelId});
        }

        visitTownSquareAndWaitForPageToLoad();

        // * find the toast
        cy.get('div.toast').should('be.visible');
        cy.get('div.toast__pointer').should('be.visible').click();
        cy.getLastPostId().then((postId) => {
            // * last posted message should be in view
            cy.get(`#postMessageText_${postId} > p`).contains('This is a message for checking action on toast [39]');
        });
    });

    it('new message toast should be removed on clicking remove button', () => {
        visitTownSquareAndWaitForPageToLoad();
        scrollUpAndPostAMessage().then(() => {
            cy.get('div.toast').should('be.visible');

            // # Click on toast dismiss button to close the toast
            cy.findByTestId('dismissToast').click();
            cy.get('div.toast').should('not.be.visible');
        });
    });

    it('Recurring visit to a channel with unreads should have unread toast ', () => {
        visitTownSquareAndWaitForPageToLoad();
        cy.visit('/ad-1/channels/off-topic');

        cy.postMessageAs({sender: otherUser, message: 'This is a new message', channelId: townsquareChannelId});
        cy.go('back');

        // # Scroll up so bottom is not visible
        scrollUp();

        // # Post a new message
        cy.get('div.toast').should('be.visible');
        cy.findByTestId('dismissToast').click();
        cy.get('div.toast').should('not.be.visible');
    });

    it('New message count should increase with incoming messages', () => {
        visitTownSquareAndWaitForPageToLoad();
        scrollUpAndPostAMessage().then(() => {
            cy.get('div.toast').should('be.visible');
            cy.get('div.toast__message>span').first().contains('1 new message');
            cy.postMessageAs({sender: otherUser, message: 'This is another new message', channelId: townsquareChannelId}).then(() => {
                cy.get('div.toast__message>span').first().contains('2 new message');
            });
        });
    });

    it('New message count should reset when dismissed', () => {
        visitTownSquareAndWaitForPageToLoad();
        scrollUpAndPostAMessage();

        cy.get('div.toast').should('be.visible');
        cy.get('div.toast__message>span').first().contains('1 new message');
        cy.findByTestId('dismissToast').click();
        cy.get('div.toast').should('not.be.visible');
        cy.postMessageAs({sender: otherUser, message: 'This is another new message', channelId: townsquareChannelId}).then(() => {
            cy.get('div.toast__message>span').first().contains('1 new message');
        });
    });

    it('Marking channel as unread should make unread toast apprear', () => {
        let postId;
        visitTownSquareAndWaitForPageToLoad();

        // # Post a new message
        cy.postMessageAs({
            sender: otherUser,
            message: 'This is a new message for marking as unread',
            channelId: townsquareChannelId
        }).then((post) => {
            postId = post.id;
            cy.get(`#post_${postId}`).trigger('mouseover');
            cy.get(`#post_${postId} .post__dropdown`).click({force: true});

            // # Mark post as unread
            cy.get(`#post_${postId} #unread_post_${postId}`).click();

            // # Visit another channel and come back to the same channel again
            cy.visit('/ad-1/channels/off-topic');
            cy.visit('/ad-1/channels/town-square');

            // # Scroll up so bottom is not visible
            scrollUp();

            // # Toast apprears and has the appropriate message
            cy.get('div.toast').should('be.visible');
            cy.get('div.toast__message>span').first().contains('1 new message');
        });
    });

    it('New message line should move if user is scrolled up and new messages arrive', () => {
        visitTownSquareAndWaitForPageToLoad();

        // # Scroll to the last post
        cy.get('div.post-list__dynamic').scrollTo('bottom', {duration: 1000});

        // # Post a new message
        cy.postMessageAs({sender: otherUser, message: 'post1', channelId: townsquareChannelId}).then(() => {
            // * The new messages line should appear above the last post
            cy.get('.NotificationSeparator').should('exist');
            cy.get('.NotificationSeparator').parent().parent().next().should('contain', 'post1');
            scrollUp();
            cy.postMessageAs({sender: otherUser, message: 'post2', channelId: townsquareChannelId}).then(() => {
                // * The new messages line should have moved to the last post
                cy.get('.NotificationSeparator').parent().parent().next().should('contain', 'post2');
            });
        });
    });
});

function visitTownSquareAndWaitForPageToLoad() {
    cy.visit('/ad-1/channels/town-square');
    cy.get('div.post-list__dynamic');
}

function scrollUpAndPostAMessage() {
    scrollUp();

    // # Without the wait the tests seem to fun flaky. Possibly because of ScrollTo having a race with post of message
    cy.wait(20); // eslint-disable-line cypress/no-unnecessary-waiting

    // # Post a new message
    return cy.postMessageAs({sender: otherUser, message: 'This is a new message', channelId: townsquareChannelId});
}

function scrollUp() {
    // # Scroll up so bottom is not visible
    cy.get('div.post-list__dynamic').scrollTo(0, '70%', {duration: 1000}).wait(1000);
}
