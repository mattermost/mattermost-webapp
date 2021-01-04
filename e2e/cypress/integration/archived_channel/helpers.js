
// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

export async function createArchivedChannel(channelOptions, messages, memberUsernames) {
    const channelName = await new Promise((resolve) => {
        cy.uiCreateChannel(channelOptions).then((newChannel) => {
            if (memberUsernames) {
                cy.uiAddUsersToCurrentChannel(memberUsernames);
            }
            if (messages) {
                let messageList = messages;
                if (!Array.isArray(messages)) {
                    messageList = [messages];
                }
                messageList.forEach((message) => {
                    cy.postMessage(message);
                });
            }
            cy.uiArchiveChannel();
            resolve(newChannel.name);
        });
    });

    cy.get('#channelArchivedMessage').should('be.visible');
    return cy.wrap({channelName});
}
