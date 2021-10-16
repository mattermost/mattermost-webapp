// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import * as TIMEOUTS from '../../fixtures/timeouts';

// # Other user posts a few messages so that the first message is hidden
export function postListOfMessages({sender, channelId, numberOfMessages = 30}) {
    Cypress._.times(numberOfMessages, (postIndex) => {
        cy.postMessageAs({sender, message: `Other users p-${postIndex}`, channelId});
    });
}

// # Scroll above the last few messages
export function scrollCurrentChannelFromTop(listPercentageRatio) {
    cy.get('div.post-list__dynamic', {timeout: TIMEOUTS.ONE_SEC}).should('be.visible').
        scrollTo(0, listPercentageRatio, {duration: TIMEOUTS.ONE_SEC}).
        wait(TIMEOUTS.ONE_SEC);
}
