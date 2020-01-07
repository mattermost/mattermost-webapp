// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// # indicates a test step (e.g. # Go to a page)
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
        cy.visit('/ad-1/channels/off-topic');
    });

    it('Unread messages toast is show when visiting a channel with unreads and should dissapear if scrolled to bottom', () => {
        // # add enough messages
        for (let index = 0; index < 30; index++) {
            cy.postMessageAs({sender: otherUser, message: `This is an old message [${index}]`, channelId: townsquareChannelId});
        }

        // # visit channel to see the unread posts
        cy.visit('/ad-1/channels/town-square');

        // # find the toast
        cy.get('div.toast').should('be.visible');

        // # check that the message is correct
        cy.get('div.toast__message>span').first().contains('30 new messages');
        cy.clock();
        cy.get('div.post-list__dynamic').scrollTo('bottom');
        cy.tick(5000);
        cy.get('div.toast').should('be.not.visible');
    });

    it('should show new message indicator when posts arrive and user is not at bottom', () => {
        visitTownSquareAndWaitForPageToLoad();
        scrollUpAndPostAMessage().then(() => {
            // # find the toast
            cy.get('div.toast').should('be.visible');

            // # check that the message is correct
            cy.get('div.toast__message>span').first().contains('1 new message');
        });
    });

    it('should remove new message indicator user scrolls to bottom', () => {
        visitTownSquareAndWaitForPageToLoad();
        scrollUpAndPostAMessage().then(() => {
            // # find the toast
            cy.get('div.toast').should('be.visible');
            cy.clock();
            cy.get('div.post-list__dynamic').scrollTo('bottom');
            cy.tick(2000);
            cy.get('div.toast').should('be.hidden');
        });
    });

    it('new message toast should not have action button when at bottom', () => {
        visitTownSquareAndWaitForPageToLoad();
        scrollUpAndPostAMessage().then(() => {
            // # find the toast
            cy.get('div.toast').should('be.visible');
            cy.get('div.toast__jump').should('be.visible');
            cy.clock();
            cy.get('div.post-list__dynamic').scrollTo('bottom');
            cy.get('div.toast__jump').should('not.be.visible');
            cy.tick(2000);
            cy.get('div.toast').should('be.hidden');
        });
    });

    it('new message toast should take to new messages line when clicked', () => {
        visitTownSquareAndWaitForPageToLoad();

        // # scroll up so bottom is not visible
        cy.get('div.post-list__dynamic').scrollTo(0, '70%');

        // # post few new message
        for (let index = 0; index < 4; index++) {
            cy.postMessageAs({sender: otherUser, message: `This is a new message [${index}]`, channelId: townsquareChannelId});
        }

        cy.get('.NotificationSeparator').should('not.be.visible');
        cy.get('div.toast__pointer').should('be.visible').click();
        cy.get('.NotificationSeparator').should('be.visible');
    });

    it('Unread messages toast should take to bottom when clicked', () => {
        // # add enough messages
        for (let index = 0; index < 40; index++) {
            cy.postMessageAs({sender: otherUser, message: `This is a message for checking action on toast [${index}]`, channelId: townsquareChannelId});
        }

        visitTownSquareAndWaitForPageToLoad();

        // # find the toast
        cy.get('div.toast').should('be.visible');
        cy.get('div.toast__pointer').should('be.visible').click();
        cy.getLastPostId().then((postId) => {
            cy.get(`#postMessageText_${postId} > p`).contains('This is a message for checking action on toast [39]');
        });
    });

    it('new message toast should be removed on clicking remove button', () => {
        visitTownSquareAndWaitForPageToLoad();
        scrollUpAndPostAMessage().then(() => {
            cy.get('div.toast').should('be.visible');
            cy.get('div.toast__dismiss').click();
            cy.get('div.toast').should('not.be.visible');
        });
    });

    it('Recurring visit to a channel with unreads should have unread toast ', () => {
        visitTownSquareAndWaitForPageToLoad();
        cy.visit('/ad-1/channels/off-topic');

        cy.postMessageAs({sender: otherUser, message: 'This is a new message', channelId: townsquareChannelId});
        cy.go('back');

        // # post a new message
        cy.get('div.toast').should('be.visible');
        cy.get('div.toast__dismiss').click();
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
        cy.get('div.toast__dismiss').click();
        cy.get('div.toast').should('not.be.visible');
        cy.postMessageAs({sender: otherUser, message: 'This is another new message', channelId: townsquareChannelId}).then(() => {
            cy.get('div.toast__message>span').first().contains('1 new message');
        });
    });

    it('Marking channel as unread should make unread toast apprear', () => {
        let postId;
        visitTownSquareAndWaitForPageToLoad();

        // # post a new message
        cy.postMessageAs({
            sender: otherUser,
            message: 'This is a new message for marking as unread',
            channelId: townsquareChannelId
        }).then((post) => {
            postId = post.id;
            cy.get(`#post_${postId}`).trigger('mouseover');
            cy.get(`#post_${postId} .post__dropdown`).click({force: true});
            cy.get(`#post_${postId} #unread_post_${postId}`).click();

            cy.get('div.toast').should('be.visible');
            cy.get('div.toast__message>span').first().contains('1 new message');
        });
    });

    it('New message line should move if user is scrolled up and new messages arrive', () => {
        visitTownSquareAndWaitForPageToLoad();

        // # post a new message
        cy.postMessageAs({sender: otherUser, message: 'post1', channelId: townsquareChannelId}).then(() => {
            // The New Messages line should appear above the last post
            cy.get('.NotificationSeparator').should('exist');
            cy.get('.NotificationSeparator').parent().parent().next().should('contain', 'post1');
            cy.get('div.post-list__dynamic').scrollTo(0, '70%');
            cy.postMessageAs({sender: otherUser, message: 'post2', channelId: townsquareChannelId}).then(() => {
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
    // # scroll up so bottom is not visible
    cy.get('div.post-list__dynamic').scrollTo(0, '70%');

    // # post a new message
    return cy.postMessageAs({sender: otherUser, message: 'This is a new message', channelId: townsquareChannelId});
}
