// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {getRandomId} from '../../utils';

Cypress.Commands.add('uiCreateChannel', ({
    prefix = 'channel-',
    isPrivate = false,
    purpose = '',
    header = '',
    isNewSidebar = false,
}) => {
    if (isNewSidebar) {
        cy.get('#SidebarContainer .AddChannelDropdown_dropdownButton').click();
        cy.get('#showNewChannel button').click();
    } else {
        cy.get('#createPrivateChannel').click();
    }

    cy.get('#newChannelModalLabel').should('be.visible');
    if (isPrivate) {
        cy.get('#private').click();
    } else {
        cy.get('#public').click();
    }
    const channelName = `${prefix}${getRandomId()}`;
    cy.get('#newChannelName').clear().type(channelName);
    if (purpose) {
        cy.get('#newChannelPurpose').clear().type(purpose);
    }
    if (header) {
        cy.get('#newChannelHeader').clear().type(header);
    }
    cy.get('#submitNewChannel').click();
    cy.get('#channelIntro').should('be.visible');
    return cy.wrap({name: channelName});
});

Cypress.Commands.add('uiAddUsersToCurrentChannel', (usernameList) => {
    if (usernameList.length) {
        cy.get('#channelHeaderDropdownIcon').click();
        cy.get('#channelAddMembers').click();
        cy.get('#addUsersToChannelModal').should('be.visible');
        usernameList.forEach((username) => {
            cy.get('#react-select-2-input').type(`@${username}{enter}`);
        });
        cy.get('#saveItems').click();
        cy.get('#addUsersToChannelModal').should('not.be.visible');
    }
});

Cypress.Commands.add('uiArchiveChannel', () => {
    cy.get('#channelHeaderDropdownIcon').click();
    cy.get('#channelArchiveChannel').click();
    return cy.get('#deleteChannelModalDeleteButton').click();
});

Cypress.Commands.add('uiLeaveChannel', (isPrivate = false) => {
    cy.get('#channelHeaderDropdownIcon').click();

    if (isPrivate) {
        cy.get('#channelLeaveChannel').click();
        return cy.get('#confirmModalButton').click();
    }

    return cy.get('#channelLeaveChannel').click();
});
