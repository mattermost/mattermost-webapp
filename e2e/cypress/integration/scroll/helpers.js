// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import * as TIMEOUTS from '../../fixtures/timeouts';

export function postMessagesAndScrollUp(otherUser, testChannelId) {
    // # Other user posts a few messages so that the first message is hidden
    Cypress._.times(30, (postIndex) => {
        cy.postMessageAs({sender: otherUser, message: `Other users p-${postIndex}`, channelId: testChannelId});
    });

    // # Scroll above the last few messages
    cy.get('div.post-list__dynamic', {timeout: TIMEOUTS.ONE_SEC}).should('be.visible').
        scrollTo(0, '90%', {duration: TIMEOUTS.ONE_SEC}).
        wait(TIMEOUTS.ONE_SEC);
}

