// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {ChainableT} from '../api/types';

import {getRandomId} from '../../utils';
import * as TIMEOUTS from '../../fixtures/timeouts';

function uiCreateChannel({
    prefix = 'channel-',
    isPrivate = false,
    purpose = '',
    name = '',
}): ChainableT<{name: string}> {
    cy.uiBrowseOrCreateChannel('Create New Channel').click();

    cy.get('#new-channel-modal').should('be.visible');
    if (isPrivate) {
        cy.get('#public-private-selector-button-P').click().wait(TIMEOUTS.HALF_SEC);
    } else {
        cy.get('#public-private-selector-button-O').click().wait(TIMEOUTS.HALF_SEC);
    }
    const channelName = name || `${prefix}${getRandomId()}`;
    cy.get('#input_new-channel-modal-name').should('be.visible').clear().type(channelName);
    if (purpose) {
        cy.get('#new-channel-modal-purpose').clear().type(purpose);
    }
    cy.findByText('Create channel').click();
    cy.get('#new-channel-modal').should('not.exist');
    cy.get('#channelIntro').should('be.visible');
    return cy.wrap({name: channelName});
}
Cypress.Commands.add('uiCreateChannel', uiCreateChannel);

function uiAddUsersToCurrentChannel(usernameList: string[]) {
    if (usernameList.length) {
        cy.get('#channelHeaderDropdownIcon').click();
        cy.get('#channelAddMembers').click();
        cy.get('#addUsersToChannelModal').should('be.visible');
        usernameList.forEach((username) => {
            cy.get('#react-select-2-input').type(`@${username}{enter}`);
        });
        cy.get('#saveItems').click();
        cy.get('#addUsersToChannelModal').should('not.exist');
    }
}
Cypress.Commands.add('uiAddUsersToCurrentChannel', uiAddUsersToCurrentChannel);

function uiArchiveChannel(): ChainableT<any> {
    cy.get('#channelHeaderDropdownIcon').click();
    cy.get('#channelArchiveChannel').click();
    return cy.get('#deleteChannelModalDeleteButton').click();
}
Cypress.Commands.add('uiArchiveChannel', uiArchiveChannel);

function uiUnarchiveChannel(): ChainableT<any> {
    cy.get('#channelHeaderDropdownIcon').click();
    cy.get('#channelUnarchiveChannel').click();
    return cy.get('#unarchiveChannelModalDeleteButton').click();
}
Cypress.Commands.add('uiUnarchiveChannel', uiUnarchiveChannel);

function uiLeaveChannel(isPrivate = false): ChainableT<any> {
    cy.get('#channelHeaderDropdownIcon').click();

    if (isPrivate) {
        cy.get('#channelLeaveChannel').click();
        return cy.get('#confirmModalButton').click();
    }

    return cy.get('#channelLeaveChannel').click();
}
Cypress.Commands.add('uiLeaveChannel', uiLeaveChannel);

function goToDm(username: string): ChainableT<any> {
    cy.uiAddDirectMessage().click({force: true});

    // # Start typing part of a username that matches previously created users
    cy.get('#selectItems input').type(username, {force: true});
    cy.findByRole('dialog', {name: 'Direct Messages'}).should('be.visible').wait(TIMEOUTS.ONE_SEC);
    cy.findByRole('textbox', {name: 'Search for people'}).click({force: true}).
        type(username).wait(TIMEOUTS.ONE_SEC).
        type('{enter}');

    // # Save the selected item
    return cy.get('#saveItems').click().wait(TIMEOUTS.HALF_SEC);
}

Cypress.Commands.add('goToDm', goToDm);

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Cypress {
        interface Chainable {

            /**
             * Create a new channel in the current team.
             * @param {string} options.prefix - Prefix for the name of the channel, it will be added a random string ot it.
             * @param {boolean} options.isPrivate - is the channel private or public (default)?
             * @param {string} options.purpose - Channel's purpose
             * @param {string} options.header - Channel's header
             * @param {boolean} options.isNewSidebar) - the new sidebar has a different ui flow, set this setting to true to use that. Defaults to false.
             *
             * @example
             *   cy.uiCreateChannel({prefix: 'private-channel-', isPrivate: true, purpose: 'my private channel', header: 'my private header', isNewSidebar: false});
             */
            uiCreateChannel: typeof uiCreateChannel;

            /**
             * Add users to the current channel.
             * @param {string[]} usernameList - list of userids to add to the channel
             *
             * @example
             *   cy.uiAddUsersToCurrentChannel(['user1', 'user2']);
             */
            uiAddUsersToCurrentChannel(usernameList: string[]): ChainableT<void>;

            /**
             * Archive the current channel.
             *
             * @example
             *   cy.uiArchiveChannel();
             */
            uiArchiveChannel: typeof uiArchiveChannel;

            /**
             * Leave the current channel.
             * @param {boolean} isPrivate - is the channel private or public (default)?
             *
             * @example
             *   cy.uiLeaveChannel(true);
             */
            uiLeaveChannel: typeof uiLeaveChannel;

            uiUnarchiveChannel: typeof uiUnarchiveChannel;

            goToDm: typeof goToDm;
        }
    }
}
