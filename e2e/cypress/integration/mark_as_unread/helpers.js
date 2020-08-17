// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

export function markAsUnreadByPostIdFromMenu(postId, prefix = 'post', location = 'CENTER') {
    cy.get(`#${prefix}_${postId}`).trigger('mouseover');
    cy.clickPostDotMenu(postId, location);
    cy.get('.dropdown-menu').
        should('be.visible').
        within(() => {
            cy.findByText('Mark as Unread').scrollIntoView().should('be.visible').click();
        });
}

export function verifyPostNextToNewMessageSeparator(message) {
    cy.get('.NotificationSeparator').should('exist').parent().parent().parent().next().should('contain', message);
}
