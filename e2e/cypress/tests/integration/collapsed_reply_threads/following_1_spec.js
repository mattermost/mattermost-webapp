// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @collapsed_reply_threads

import * as TIMEOUTS from '../../fixtures/timeouts';
import {isMac} from '../../utils';

describe('Collapsed Reply Threads', () => {
    let testTeam;
    let testUser;
    let otherUser;
    let testChannel;

    before(() => {
        cy.apiUpdateConfig({
            ServiceSettings: {
                ThreadAutoFollow: true,
                CollapsedThreads: 'default_off',
            },
        });

        // # Create new channel and other user and add other user to channel
        cy.apiInitSetup({loginAfter: true, promoteNewUserAsAdmin: true}).then(({team, channel, user}) => {
            testTeam = team;
            testUser = user;
            testChannel = channel;

            cy.apiSaveCRTPreference(testUser.id, 'on');
            cy.apiCreateUser({prefix: 'other'}).then(({user: user1}) => {
                otherUser = user1;

                cy.apiAddUserToTeam(testTeam.id, otherUser.id).then(() => {
                    cy.apiAddUserToChannel(testChannel.id, otherUser.id);
                });
            });
        });
    });

    beforeEach(() => {
        // # Visit channel
        cy.visit(`/${testTeam.name}/channels/${testChannel.name}`);
    });

    it('MM-T4682 should show search guidance at the end of the list after scroll loading -- KNOWN ISSUE: MM-41565', () => {
        // # Create more than 25 threads so we can use scroll loading in the Threads list
        for (let i = 1; i <= 30; i++) {
            postMessageWithReply(testChannel.id, otherUser, `Another interesting post ${i}`, testUser, `Another reply ${i}!`).then(({rootId}) => {
                // # Mark last thread as Unread
                if (i === 30) {
                    // # Click on root post to open thread
                    cy.get(`#post_${rootId}`).click();

                    // # Click on the reply's dot menu and mark as unread
                    cy.uiClickPostDropdownMenu(rootId, 'Mark as Unread', 'RHS_ROOT');
                }
            });
        }

        cy.uiClickSidebarItem('threads');

        // # Scroll load the threads list to reach the end
        const maxScrolls = 3;
        scrollThreadsListToEnd(maxScrolls);

        // * Search guidance item should be shown at the end of the threads list
        cy.get('.ThreadList .no-results__wrapper').should('be.visible').within(() => {
            // * Title, subtitle and shortcut keys should be shown
            cy.findByText('That’s the end of the list').should('be.visible');
            cy.contains('If you’re looking for older conversations, try searching with ').should('be.visible').within(() => {
                cy.findByText(isMac() ? '⌘' : 'Ctrl').should('be.visible');
                cy.findByText('Shift').should('be.visible');
                cy.findByText('F').should('be.visible');
            });
        });

        // # Click Unreads button
        cy.findByText('Unreads').click();

        // * Search guidance item should not be shown at the end of the Unreads threads list
        cy.get('.ThreadList .no-results__wrapper').should('not.exist');
    });
});

function postMessageWithReply(channelId, postSender, postMessage, replySender, replyMessage) {
    return cy.postMessageAs({
        sender: postSender,
        message: postMessage || 'Another interesting post.',
        channelId,
    }).then(({id: rootId}) => {
        cy.postMessageAs({
            sender: replySender || postSender,
            message: replyMessage || 'Another reply!',
            channelId,
            rootId,
        }).then(({id: replyId}) => (Promise.resolve({rootId, replyId})));
    });
}

function scrollThreadsListToEnd(maxScrolls = 1, scrolls = 0) {
    if (scrolls === maxScrolls) {
        return;
    }

    cy.get('.ThreadList .virtualized-thread-list').scrollTo('bottom').then(($el) => {
        const element = $el.find('.no-results__wrapper');

        if (element.length < 1) {
            cy.wait(TIMEOUTS.ONE_SEC).then(() => {
                scrollThreadsListToEnd(maxScrolls, scrolls + 1);
            });
        } else {
            cy.wrap(element).scrollIntoView();
        }
    });
}
