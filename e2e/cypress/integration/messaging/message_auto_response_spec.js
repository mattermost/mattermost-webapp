// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @auto_response @messaging

describe('Auto Response In DMs', () => {
    const AUTO_RESPONSE_MESSAGE = 'Out of Office';
    const MESSAGE = 'Message';
    let userA;
    let userB;
    let testTeam;
    let offTopicChannelUrl;

    before(() => {
        // # Enable ExperimentalEnableAutomaticReplies setting
        cy.apiUpdateConfig({TeamSettings: {ExperimentalEnableAutomaticReplies: true}});

        // # Create a new team
        cy.apiInitSetup().then(({team, user}) => {
            userA = user;
            testTeam = team;

            // # Create a second user
            cy.apiCreateUser().then(({user: createdUser}) => {
                userB = createdUser;
                cy.apiAddUserToTeam(team.id, userB.id);
            });

            offTopicChannelUrl = `/${testTeam.name}/channels/town-square`;
        });
    });

    it('MM-T4004_1 Login as userB and set auto response message', () => {
        // # Login as userB
        cy.apiLogin(userB);

        // # Visit off topic channel
        cy.visit(offTopicChannelUrl);

        // # Open 'Account Settings' modal and view 'Notifications'
        cy.uiOpenAccountSettingsModal('Notifications').within(() => {
            // # Click on 'Edit' for 'Automatic Direct Message Replies
            cy.get('#auto-responderEdit').should('be.visible').click();

            // # Click on 'Enabled' checkbox
            cy.get('#autoResponderActive').should('be.visible').click();

            // # Clear default auto response message
            cy.get('#autoResponderMessageInput').should('be.visible').clear();

            // # Enter new Auto Response Message
            cy.get('#autoResponderMessageInput').should('be.visible').type(AUTO_RESPONSE_MESSAGE);

            // # Save and close the modal
            cy.uiSaveAndClose();
        });

        // # Logout userB
        cy.apiLogout();
    });

    it('MM-T4004_1 Login as userA and send direct messages and verify only one auto response message is sent from userB', () => {
        // # Login as userA
        cy.apiLogin(userA);

        // # Visit off topic channel
        cy.visit(offTopicChannelUrl);

        // # Send direct message to userB
        cy.uiAddDirectMessage().click();
        cy.get('#selectItems').type(`${userB.username}`);
        cy.findByText('Loading').should('be.visible');
        cy.findByText('Loading').should('not.exist');
        cy.get('#multiSelectList').findByText(`@${userB.username}`).click();
        cy.findByText('Go').click();
        cy.postMessage(MESSAGE);

        // * Verify if auto response message is last post displayed
        cy.getLastPostId().then((replyId) => {
            cy.get(`#postMessageText_${replyId}`).should('be.visible').and('have.text', AUTO_RESPONSE_MESSAGE);
        });

        // # Send another direct message to userB
        cy.postMessage(MESSAGE);

        // * Verify if auto response message is last post displayed
        cy.getLastPostId().then((replyId) => {
            cy.get(`#postMessageText_${replyId}`).should('be.visible').and('have.text', MESSAGE);
        });

        // # Send another direct message to userB
        cy.postMessage(MESSAGE);

        // * Verify if auto response message is last post displayed
        cy.getLastPostId().then((replyId) => {
            cy.get(`#postMessageText_${replyId}`).should('be.visible').and('have.text', MESSAGE);
        });

        // # Logout userA
        cy.apiLogout();
    });
});
